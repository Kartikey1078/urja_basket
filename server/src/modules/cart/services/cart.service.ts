import { HttpError } from "../../../errors/httpError";
import { findUserByClerkId } from "../../users/repositories/user.repository";
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
  input: { productId?: number; productSlug?: string; quantity: number }
): Promise<CartResponse> {
  const quantity = clampQuantity(input.quantity);
  const product = await resolveProduct(input);
  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  const { cartId } = await getCartContext(clerkId);
  const existing = await cartRepo.findCartItemByProductId(cartId, product.id);

  if (existing) {
    const nextQty = clampQuantity(existing.quantity + quantity);
    await cartRepo.updateCartItemQuantity(existing.id, cartId, nextQty);
  } else {
    await cartRepo.insertCartItem(cartId, product.id, quantity);
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

    const product = await cartRepo.findProductForCartBySlug(guest.productSlug);
    if (!product) continue;

    const existing = await cartRepo.findCartItemByProductId(cartId, product.id);
    if (existing) {
      const merged =
        mergeStrategy === "replace"
          ? qty
          : clampQuantity(existing.quantity + qty);
      await cartRepo.updateCartItemQuantity(existing.id, cartId, merged);
    } else {
      try {
        await cartRepo.insertCartItem(cartId, product.id, qty);
      } catch (err) {
        const duplicate =
          err instanceof Error &&
          "code" in err &&
          (err as { code?: string }).code === "ER_DUP_ENTRY";
        if (duplicate) {
          const raced = await cartRepo.findCartItemByProductId(cartId, product.id);
          if (raced) {
            const merged =
              mergeStrategy === "replace"
                ? qty
                : clampQuantity(raced.quantity + qty);
            await cartRepo.updateCartItemQuantity(raced.id, cartId, merged);
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

async function resolveProduct(input: {
  productId?: number;
  productSlug?: string;
}): Promise<ProductCartRow | null> {
  if (input.productId != null) {
    return cartRepo.findProductForCartById(input.productId);
  }
  if (input.productSlug) {
    return cartRepo.findProductForCartBySlug(input.productSlug);
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
    packagingCharges: totals.platformFee,
    sitePromoDiscount: totals.sitePromoDiscount,
    couponDiscount: totals.couponDiscount,
    discount: totals.discount,
    tax: totals.tax,
    toPay: totals.grandTotal,
  };
}
