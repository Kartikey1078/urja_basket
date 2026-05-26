import { getApiBaseUrl } from "@/lib/api";

import type { OrderListItem, OrderTracking } from "./types";

async function ordersFetch<T>(
  path: string,
  init?: RequestInit & { token?: string | null }
): Promise<T> {
  const headers: Record<string, string> = {
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

  const text = await res.text();
  let body: { data?: T; error?: string } = {};
  try {
    body = text ? (JSON.parse(text) as { data?: T; error?: string }) : {};
  } catch {
    throw new Error(text.slice(0, 200) || `Request failed (${res.status})`);
  }
  if (!res.ok) {
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  if (!body.data) {
    throw new Error("Invalid response");
  }
  return body.data;
}

export async function fetchOrderTracking(
  orderId: number,
  options?: { token?: string | null; phone?: string }
): Promise<OrderTracking> {
  const params = new URLSearchParams();
  if (options?.phone) {
    params.set("phone", options.phone);
  }
  const qs = params.toString();
  return ordersFetch<OrderTracking>(
    `/api/v1/orders/${orderId}/tracking${qs ? `?${qs}` : ""}`,
    { token: options?.token }
  );
}

export async function fetchMyOrders(token: string): Promise<OrderListItem[]> {
  return ordersFetch<OrderListItem[]>("/api/v1/orders", { token });
}
