"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { clearActiveOrder, getActiveOrder } from "@/lib/orders/active-order";
import { fetchMyOrders, fetchOrderTracking } from "@/lib/orders/api";
import type { FulfillmentStatus } from "@/lib/orders/types";

const STATUS_LABEL: Record<FulfillmentStatus, string> = {
  order_placed: "Order placed",
  preparing: "Getting packed",
  out_for_delivery: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export type ActiveOrderSummary = {
  orderId: number;
  orderNumber: string;
  statusLabel: string;
};

const HIDDEN_PREFIXES = ["/orders/track", "/cart", "/checkout"];

export function useActiveOrder() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const storedRef = useMemo(() => getActiveOrder(), []);

  const hidden = HIDDEN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  const query = useQuery({
    queryKey: ["active-order-track", isSignedIn, storedRef?.orderId],
    queryFn: async (): Promise<ActiveOrderSummary | null> => {
      if (isSignedIn) {
        const token = await getToken();
        if (!token) return null;
        const orders = await fetchMyOrders(token);
        const active = orders.find((o) => o.isActive);
        if (!active) {
          clearActiveOrder();
          return null;
        }
        return {
          orderId: active.id,
          orderNumber: active.orderNumber,
          statusLabel: STATUS_LABEL[active.fulfillmentStatus] ?? "In progress",
        };
      }

      const ref = storedRef ?? getActiveOrder();
      if (!ref) return null;

      const tracking = await fetchOrderTracking(ref.orderId, { phone: ref.phone });
      if (!tracking.isActive || tracking.fulfillmentStatus === "delivered") {
        clearActiveOrder();
        return null;
      }

      return {
        orderId: ref.orderId,
        orderNumber: ref.orderNumber,
        statusLabel: STATUS_LABEL[tracking.fulfillmentStatus] ?? "In progress",
      };
    },
    enabled: isLoaded && !hidden,
    refetchInterval: 20_000,
    staleTime: 10_000,
  });

  return {
    activeOrder: hidden ? null : (query.data ?? null),
    loading: query.isLoading && !hidden,
  };
}
