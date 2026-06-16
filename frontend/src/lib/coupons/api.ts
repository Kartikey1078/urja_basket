import { getApiBaseUrl } from "@/lib/api";
import type { CartItem } from "@/lib/cart/types";

import type { AppliedCouponPreview, CouponOffer } from "./types";

function previewItems(items: CartItem[]) {
  return items.map((i) => ({ productSlug: i.slug, quantity: i.quantity }));
}

async function couponFetch<T>(
  path: string,
  init?: RequestInit & { token?: string | null }
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };
  if (init?.token) {
    headers.Authorization = `Bearer ${init.token}`;
  }

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const body = (await res.json().catch(() => ({}))) as { data?: T; error?: string };
  if (!res.ok) {
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  if (body.data === undefined) {
    throw new Error("Invalid response");
  }
  return body.data;
}

export async function fetchCouponOffers(
  items: CartItem[],
  token?: string | null
): Promise<CouponOffer[]> {
  return couponFetch<CouponOffer[]>("/api/v1/coupons/offers", {
    method: "POST",
    token,
    body: JSON.stringify({ items: previewItems(items) }),
  });
}

export async function previewCoupon(
  code: string,
  items: CartItem[],
  token?: string | null
): Promise<AppliedCouponPreview> {
  return couponFetch<AppliedCouponPreview>("/api/v1/coupons/preview", {
    method: "POST",
    token,
    body: JSON.stringify({ code, items: previewItems(items) }),
  });
}

export async function applyCouponToCart(
  code: string,
  token: string
): Promise<{
  items: CartItem[];
  bill: import("@/lib/cart/types").BillSummary;
  coupon: import("./types").CartCouponDto | null;
}> {
  const data = await couponFetch<{
    items: import("@/lib/cart/api").ServerCartLine[];
    totals: import("@/lib/cart/api").ServerCartTotals;
    coupon: import("./types").CartCouponDto | null;
  }>("/api/v1/coupons/apply", {
    method: "POST",
    token,
    body: JSON.stringify({ code }),
  });

  const { serverLineToCartItem, serverTotalsToBill } = await import("@/lib/cart/api");
  return {
    items: data.items.map(serverLineToCartItem),
    bill: serverTotalsToBill(data.totals),
    coupon: data.coupon,
  };
}

export async function applyBestCoupon(token: string) {
  const data = await couponFetch<{
    items: import("@/lib/cart/api").ServerCartLine[];
    totals: import("@/lib/cart/api").ServerCartTotals;
    coupon: import("./types").CartCouponDto | null;
  }>("/api/v1/coupons/best", {
    method: "POST",
    token,
  });

  const { serverLineToCartItem, serverTotalsToBill } = await import("@/lib/cart/api");
  return {
    items: data.items.map(serverLineToCartItem),
    bill: serverTotalsToBill(data.totals),
    coupon: data.coupon,
  };
}

export async function removeCartCoupon(token: string) {
  const data = await couponFetch<{
    items: import("@/lib/cart/api").ServerCartLine[];
    totals: import("@/lib/cart/api").ServerCartTotals;
    coupon: null;
  }>("/api/v1/coupons/remove", { method: "DELETE", token });

  const { serverLineToCartItem, serverTotalsToBill } = await import("@/lib/cart/api");
  return {
    items: data.items.map(serverLineToCartItem),
    bill: serverTotalsToBill(data.totals),
    coupon: null as import("./types").CartCouponDto | null,
  };
}
