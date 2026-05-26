"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import {
  createRazorpayOrder,
  deliveryAddressToCheckoutPayload,
  verifyRazorpayPayment,
} from "@/lib/payments/api";
import { openRazorpayCheckout } from "@/lib/payments/razorpay-checkout";
import type { DeliveryAddress } from "@/lib/address/types";
import type { DeliverySlotId } from "@/lib/cart/types";
import { useCartStore } from "@/stores/cart-store";

type PayInput = {
  amountInr: number;
  address: DeliveryAddress;
  deliverySlot?: DeliverySlotId;
  description?: string;
};

export function useRazorpayCheckout() {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const [paying, setPaying] = useState(false);

  const startPayment = useCallback(
    async ({ amountInr, address, deliverySlot, description }: PayInput) => {
      if (amountInr <= 0) {
        toast.error("Invalid order amount");
        return;
      }

      setPaying(true);
      try {
        const token = isSignedIn ? await getToken() : null;
        const amountPaise = Math.round(amountInr * 100);
        const cartItems = useCartStore.getState().items;

        const order = await createRazorpayOrder(
          {
            amountPaise,
            deliverySlot: deliverySlot ?? "express",
            address: deliveryAddressToCheckoutPayload(address),
            items: isSignedIn
              ? undefined
              : cartItems.map((item) => ({
                  productSlug: item.slug,
                  quantity: item.quantity,
                })),
          },
          token
        );

        await openRazorpayCheckout({
          orderId: order.razorpayOrderId,
          amountPaise: order.amountPaise,
          currency: order.currency,
          keyId: order.keyId,
          name: address.fullName,
          phone: address.phoneNumber,
          email: user?.primaryEmailAddress?.emailAddress ?? undefined,
          description: description ?? `Order ${order.order.orderNumber}`,
          onDismiss: () => setPaying(false),
          onFailed: (message) => {
            toast.error(message);
            setPaying(false);
          },
          onSuccess: async (response) => {
            try {
              const result = await verifyRazorpayPayment(
                {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                },
                token
              );
              toast.success("Order placed successfully!", {
                description: `${result.orderNumber} · Payment ${result.razorpayPaymentId.slice(0, 12)}…`,
              });
              if (isSignedIn) {
                useCartStore.setState({ items: [], bill: null, mode: "authenticated" });
              } else {
                useCartStore.getState().setGuestItems([]);
              }
            } catch (e) {
              toast.error(
                e instanceof Error ? e.message : "Payment received but verification failed"
              );
            } finally {
              setPaying(false);
            }
          },
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not start payment");
        setPaying(false);
      }
    },
    [getToken, isSignedIn, user?.primaryEmailAddress?.emailAddress]
  );

  return { startPayment, paying };
}
