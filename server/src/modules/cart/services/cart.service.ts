import { HttpError } from "../../../errors/httpError";
import { findUserByClerkId } from "../../users/repositories/user.repository";
import * as inventoryRepo from "../../inventory/repositories/inventory.repository";
import * as productRepo from "../../products/repositories/product.repository";
import type { CartLineDto, CartResponse, CartTotals, GuestSyncItem } from "../cart.types";
import * as cartRepo from "../repositories/cart.repository";
import type { CartItemRow, ProductCartRow } from "../repositories/cart.repository";

const MAX_QUANTITY = 99;

function parseMoney(value: string | null | undefined): number {
  if (value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function productTag(row: { is_best_seller: number; is_organic: number }): string | null {
  if (row.is_best_seller) return "Bestseller";
  if (row.is_organic) return "Organic";
  return null;
}

function rowToLineDto(row: CartItemRow): CartLineDto {
  const price = parseMoney(row.card_price);
  const mrp = parseMoney(row.card_original_price) || price;
  return {
    lineItemId: row.id,
    productId: row.product_id,
    slug: row.slug,
    name: row.name,
    subtitle: row.card_weight ?? "",
    variantSku: row.variant_sku ?? "",
    tag: productTag(row),
    price,
    mrp,
    image: row.main_image ?? "",
    quantity: row.quantity,
    lineTotal: Math.round(price * row.quantity * 100) / 100,
  };
}

async function buildCartResponse(
  cartId: number,
  rows: CartItemRow[],
  userId: number
): Promise<CartResponse> {
  const items = rows.map(rowToLineDto);
  const { buildCartTotalsWithCoupon } = await import(
    "../../coupons/services/coupon-cart.service"
  );
  const { totals, coupon } = await buildCartTotalsWithCoupon(items, cartId, userId);
  return { cartId, items, totals, coupon };
}

async function resolveUserId(clerkId: string): Promise<number> {
  const user = await findUserByClerkId(clerkId);
  if (!user) {
    throw new HttpError(401, "User profile not found. Call GET /api/me first.");
  }
  return user.id;
}

async function getCartContext(clerkId: string) {
  const userId = await resolveUserId(clerkId);
  const cartId = await cartRepo.getOrCreateCartId(userId);
  return { userId, cartId };
}

async function buildResponseForUser(cartId: number, userId: number): Promise<CartResponse> {
  const rows = await cartRepo.listCartItems(cartId);
  return buildCartResponse(cartId, rows, userId);
}

export async function getCartForUser(clerkId: string): Promise<CartResponse> {
  const { userId, cartId } = await getCartContext(clerkId);
  return buildResponseForUser(cartId, userId);
}

export async function addItemToCart(
  clerkId: string,
  input: { productId?: number; productSlug?: string; variantSku?: string; quantity: number }
): Promise<CartResponse> {
  const quantity = clampQuantity(input.quantity);
  let variantSku = (input.variantSku ?? "").trim();
  const product = await resolveProduct(input, variantSku);
  if (!product) {
    throw new HttpError(404, "Product not found or unavailable");
  }

  if (!variantSku) {
    variantSku = await productRepo.findDefaultInStockVariantSku(product.id);
  }

  const stockCheck = await inventoryRepo.checkLineAvailability(
    product.id,
    product.card_weight,
    quantity,
    variantSku || null
  );
  if (!stockCheck.ok) {
    throw new HttpError(400, "Insufficient stock for this variant");
  }

  const { cartId } = await getCartContext(clerkId);
  const existing = await cartRepo.findCartItemByLineKey(cartId, product.id, variantSku);

  if (existing) {
    const nextQty = clampQuantity(existing.quantity + quantity);
    if (nextQty > stockCheck.available) {
      throw new HttpError(400, `Only ${stockCheck.available} units available`);
    }
    await cartRepo.updateCartItemQuantity(existing.id, cartId, nextQty);
  } else {
    await cartRepo.insertCartItem(cartId, product.id, quantity, variantSku);
  }

  await cartRepo.touchCart(cartId);
  const { userId } = await getCartContext(clerkId);
  return buildResponseForUser(cartId, userId);
}

export async function updateCartItemQuantity(
  clerkId: string,
  lineItemId: number,
  quantity: number
): Promise<CartResponse> {
  const qty = clampQuantity(quantity);
  const { cartId } = await getCartContext(clerkId);
  const line = await cartRepo.findCartItemById(lineItemId, cartId);
  if (!line) {
    throw new HttpError(404, "Cart item not found");
  }

  await cartRepo.updateCartItemQuantity(lineItemId, cartId, qty);
  await cartRepo.touchCart(cartId);
  const { userId } = await getCartContext(clerkId);
  return buildResponseForUser(cartId, userId);
}

export async function removeCartItem(
  clerkId: string,
  lineItemId: number
): Promise<CartResponse> {
  const { cartId } = await getCartContext(clerkId);
  const line = await cartRepo.findCartItemById(lineItemId, cartId);
  if (!line) {
    throw new HttpError(404, "Cart item not found");
  }

  await cartRepo.deleteCartItem(lineItemId, cartId);
  await cartRepo.touchCart(cartId);
  const { userId } = await getCartContext(clerkId);
  return buildResponseForUser(cartId, userId);
}

export async function syncGuestCart(
  clerkId: string,
  guestItems: GuestSyncItem[],
  mergeStrategy: "add" | "replace" = "add"
): Promise<CartResponse> {
  const { cartId } = await getCartContext(clerkId);

  for (const guest of guestItems) {
    const qty = clampQuantity(guest.quantity);
    if (qty < 1) continue;

    const product = await cartRepo.findProductForCartBySlug(
      guest.productSlug,
      guest.variantSku ?? ""
    );
    if (!product) continue;

    const variantSku =
      (guest.variantSku ?? "").trim() ||
      (await productRepo.findDefaultInStockVariantSku(product.id));
    if (!variantSku) continue;

    const stockCheck = await inventoryRepo.checkLineAvailability(
      product.id,
      product.card_weight,
      qty,
      variantSku
    );
    if (!stockCheck.ok || stockCheck.available < 1) continue;

    const safeQty = Math.min(qty, stockCheck.available);

    const existing = await cartRepo.findCartItemByLineKey(cartId, product.id, variantSku);
    if (existing) {
      const merged =
        mergeStrategy === "replace"
          ? safeQty
          : clampQuantity(existing.quantity + safeQty);
      const mergedCheck = await inventoryRepo.checkLineAvailability(
        product.id,
        product.card_weight,
        merged,
        variantSku
      );
      if (!mergedCheck.ok || mergedCheck.available < 1) continue;
      await cartRepo.updateCartItemQuantity(
        existing.id,
        cartId,
        Math.min(merged, mergedCheck.available)
      );
    } else {
      try {
        await cartRepo.insertCartItem(cartId, product.id, safeQty, variantSku);
      } catch (err) {
        const duplicate =
          err instanceof Error &&
          "code" in err &&
          (err as { code?: string }).code === "ER_DUP_ENTRY";
        if (duplicate) {
          const raced = await cartRepo.findCartItemByLineKey(cartId, product.id, variantSku);
          if (raced) {
            const merged =
              mergeStrategy === "replace"
                ? safeQty
                : clampQuantity(raced.quantity + safeQty);
            const mergedCheck = await inventoryRepo.checkLineAvailability(
              product.id,
              product.card_weight,
              merged,
              variantSku
            );
            if (!mergedCheck.ok || mergedCheck.available < 1) continue;
            await cartRepo.updateCartItemQuantity(
              raced.id,
              cartId,
              Math.min(merged, mergedCheck.available)
            );
          }
        }
      }
    }
  }

  await cartRepo.touchCart(cartId);
  const { userId } = await getCartContext(clerkId);
  return buildResponseForUser(cartId, userId);
}

export async function removeCartCoupon(clerkId: string): Promise<CartResponse> {
  const { userId, cartId } = await getCartContext(clerkId);
  await cartRepo.clearCartCoupon(cartId);
  return buildResponseForUser(cartId, userId);
}

export type ValidatedGuestLine = {
  productSlug: string;
  variantSku: string;
  quantity: number;
};

/** Drop or clamp guest cart lines that are inactive or out of stock. */
export async function validateGuestCartLines(
  items: GuestSyncItem[]
): Promise<ValidatedGuestLine[]> {
  const valid: ValidatedGuestLine[] = [];

  for (const item of items) {
    const qty = clampQuantity(item.quantity);
    const product = await cartRepo.findProductForCartBySlug(
      item.productSlug,
      item.variantSku ?? ""
    );
    if (!product) continue;

    let variantSku = (item.variantSku ?? "").trim();
    if (!variantSku) {
      variantSku = await productRepo.findDefaultInStockVariantSku(product.id);
      if (!variantSku) continue;
    }

    const check = await inventoryRepo.checkLineAvailability(
      product.id,
      product.card_weight,
      qty,
      variantSku
    );
    if (!check.ok || check.available < 1) continue;

    valid.push({
      productSlug: item.productSlug,
      variantSku,
      quantity: Math.min(qty, check.available),
    });
  }

  return valid;
}

async function resolveProduct(
  input: {
    productId?: number;
    productSlug?: string;
  },
  variantSku = ""
): Promise<ProductCartRow | null> {
  if (input.productId != null) {
    return cartRepo.findProductForCartById(input.productId, variantSku);
  }
  if (input.productSlug) {
    return cartRepo.findProductForCartBySlug(input.productSlug, variantSku);
  }
  return null;
}

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity) || quantity < 1) {
    throw new HttpError(400, "Quantity must be at least 1");
  }
  return Math.min(MAX_QUANTITY, Math.floor(quantity));
}

export function mapTotalsToLegacyBill(totals: CartTotals) {
  return {
    itemTotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    deliveryFeeWaived: totals.deliveryFeeWaived,
    couponDiscount: totals.couponDiscount,
    discount: totals.discount,
    tax: totals.tax,
    toPay: totals.grandTotal,
  };
}
