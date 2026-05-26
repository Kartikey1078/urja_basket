"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { fetchMyOrders } from "@/lib/orders/api";
import type { FulfillmentStatus } from "@/lib/orders/types";

const STATUS_LABEL: Record<FulfillmentStatus, string> = {
  order_placed: "Order placed",
  preparing: "Getting packed",
  out_for_delivery: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrdersListScreen() {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  const orders = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Sign in required");
      return fetchMyOrders(token);
    },
    enabled: isLoaded && isSignedIn,
  });

  if (!isLoaded) {
    return <p className="px-4 py-8 text-sm text-slate-500">Loading…</p>;
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <h1 className="text-urja-forest text-xl font-bold">Your orders</h1>
        <p className="text-muted-foreground mt-2 text-sm">Sign in to see order history and tracking.</p>
        <Link
          href="/login"
          className="bg-urja-forest text-urja-cream mt-6 inline-flex rounded-xl px-6 py-2.5 text-sm font-semibold"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-urja-forest text-xl font-bold">Your orders</h1>
      <p className="text-muted-foreground mt-1 text-sm">Tap an order for live tracking</p>

      <ul className="mt-6 space-y-3">
        {orders.isLoading ? (
          <li className="text-sm text-slate-500">Loading orders…</li>
        ) : orders.data?.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-10 text-center text-sm text-slate-500">
            No orders yet. Start shopping!
          </li>
        ) : (
          orders.data?.map((o) => (
            <li key={o.id}>
              <Link
                href={`/orders/track/${o.id}`}
                className="block rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm transition hover:border-urja-forest/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-urja-forest font-bold">{o.orderNumber}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {new Date(o.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <span className="text-urja-forest shrink-0 text-sm font-bold">
                    ₹{o.grandTotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-urja-forest/80 mt-2 text-sm font-semibold">
                  {STATUS_LABEL[o.fulfillmentStatus] ?? o.fulfillmentStatus}
                  {o.isActive ? (
                    <span className="ml-2 inline-flex size-2 animate-pulse rounded-full bg-emerald-500" />
                  ) : null}
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
