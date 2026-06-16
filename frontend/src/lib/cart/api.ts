import { getApiBaseUrl } from "@/lib/api";

import type { BillSummary, CartItem } from "./types";

export type ServerCartTotals = {
  subtotal: number;
  deliveryFee: number;
  deliveryFeeWaived: boolean;
  platformFee: number;
  sitePromoDiscount: number;
  couponDiscount: number;
  discount: number;
  tax: number;
  grandTotal: number;
};

export type ServerCartLine = {
  lineItemId: number;
  productId: number;
  slug: string;
  name: string;
  subtitle: string;
  tag: string | null;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
  lineTotal: number;
};

export type ServerCartPayload = {
  cartId: number;
  items: ServerCartLine[];
  totals: ServerCartTotals;
  coupon: {
    code: string;
    title: string;
    couponDiscount: number;
    freeDelivery: boolean;
  } | null;
};

async function cartFetch<T>(
  path: string,
  token: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
    cache: "no-store",
  });

  const body = (await res.json().catch(() => ({}))) as { data?: T; error?: string };
  if (!res.ok) {
    throw new Error(body.error ?? `Cart request failed (${res.status})`);
  }
  if (!body.data) {
    throw new Error("Invalid cart response");
  }
  return body.data;
}

export function serverLineToCartItem(line: ServerCartLine): CartItem {
  return {
    id: String(line.lineItemId),
    lineItemId: line.lineItemId,
    productId: line.productId,
    slug: line.slug,
    name: line.name,
    subtitle: line.subtitle,
    tag: line.tag ?? undefined,
    price: line.price,
    mrp: line.mrp,
    image: line.image,
    quantity: line.quantity,
  };
}

export function serverTotalsToBill(totals: ServerCartTotals): BillSummary {
  return {
    itemTotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    deliveryFeeWaived: totals.deliveryFeeWaived,
    packagingCharges: totals.platformFee,
    sitePromoDiscount: totals.sitePromoDiscount ?? 0,
    couponDiscount: totals.couponDiscount ?? 0,
    discount: totals.discount,
    tax: totals.tax,
    toPay: totals.grandTotal,
    authoritative: true,
  };
}

export async function fetchServerCart(token: string): Promise<{
  items: CartItem[];
  bill: BillSummary;
  coupon: ServerCartPayload["coupon"];
}> {
  const data = await cartFetch<ServerCartPayload>("/api/v1/cart", token);
  return {
    items: data.items.map(serverLineToCartItem),
    bill: serverTotalsToBill(data.totals),
    coupon: data.coupon,
  };
}

export async function addServerCartItem(
  token: string,
  input: { productSlug: string; quantity?: number }
): Promise<{ items: CartItem[]; bill: BillSummary }> {
  const data = await cartFetch<ServerCartPayload>("/api/v1/cart/items", token, {
    method: "POST",
    body: JSON.stringify({
      productSlug: input.productSlug,
      quantity: input.quantity ?? 1,
    }),
  });
  return {
    items: data.items.map(serverLineToCartItem),
    bill: serverTotalsToBill(data.totals),
  };
}

export async function updateServerCartItem(
  token: string,
  lineItemId: number,
  quantity: number
): Promise<{ items: CartItem[]; bill: BillSummary }> {
  const data = await cartFetch<ServerCartPayload>(`/api/v1/cart/items/${lineItemId}`, token, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
  return {
    items: data.items.map(serverLineToCartItem),
    bill: serverTotalsToBill(data.totals),
  };
}

export async function removeServerCartItem(
  token: string,
  lineItemId: number
): Promise<{ items: CartItem[]; bill: BillSummary }> {
  const data = await cartFetch<ServerCartPayload>(`/api/v1/cart/items/${lineItemId}`, token, {
    method: "DELETE",
  });
  return {
    items: data.items.map(serverLineToCartItem),
    bill: serverTotalsToBill(data.totals),
  };
}

export async function syncGuestCartToServer(
  token: string,
  items: { productSlug: string; quantity: number }[]
): Promise<{ items: CartItem[]; bill: BillSummary }> {
  const data = await cartFetch<ServerCartPayload>("/api/v1/cart/sync", token, {
    method: "POST",
    body: JSON.stringify({ items }),
  });
  return {
    items: data.items.map(serverLineToCartItem),
    bill: serverTotalsToBill(data.totals),
  };
}
