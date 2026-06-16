"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import {
  deliveryAddressToCheckoutPayload,
  isCodOrderResponse,
  placeCheckoutOrder,
  verifyRazorpayPayment,
} from "@/lib/payments/api";
import { openRazorpayCheckout } from "@/lib/payments/razorpay-checkout";
import type { DeliveryAddress } from "@/lib/address/types";
import type { DeliverySlotId } from "@/lib/cart/types";
import { saveLastOrder } from "@/lib/orders/last-order";
import type { PaymentMethodChoice } from "@/stores/checkout-store";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useCartStore } from "@/stores/cart-store";

type CheckoutInput = {
  amountInr: number;
  address: DeliveryAddress;
  deliverySlot?: DeliverySlotId;
  paymentMethod: PaymentMethodChoice;
  description?: string;
  /** Called right before navigating to tracking (e.g. close cart checkout UI). */
  onPlaced?: () => void;
};

function clearLocalCart(isSignedIn: boolean) {
  if (isSignedIn) {
    useCartStore.setState({
      items: [],
      bill: null,
      appliedCoupon: null,
      guestCouponCode: null,
      mode: "authenticated",
    });
  } else {
    useCartStore.getState().setGuestItems([]);
    useCartStore.setState({ guestCouponCode: null });
  }
}

function goToTracking(
  router: ReturnType<typeof useRouter>,
  orderId: number,
  orderNumber: string,
  phone: string,
  onPlaced?: () => void
) {
  if (!Number.isInteger(orderId) || orderId <= 0) {
    toast.error("Order placed but tracking is unavailable. Contact support with your order number.");
    return;
  }
  saveLastOrder({ orderId, orderNumber, phone });
  useCheckoutStore.getState().clearCheckout();
  onPlaced?.();
  router.replace(`/orders/track/${orderId}?placed=1`);
}

export function useCheckout() {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const [processing, setProcessing] = useState(false);

  const completeCheckout = useCallback(
    async ({
      amountInr,
      address,
      deliverySlot,
      paymentMethod,
      description,
      onPlaced,
    }: CheckoutInput) => {
      if (amountInr <= 0) {
        toast.error("Invalid order amount");
        return;
      }

      setProcessing(true);
      try {
        const token = isSignedIn ? await getToken() : null;
        const amountPaise = Math.round(amountInr * 100);
        const cartState = useCartStore.getState();
        const cartItems = cartState.items;
        const couponCode =
          cartState.appliedCoupon?.code ?? cartState.guestCouponCode ?? undefined;

        const result = await placeCheckoutOrder(
          {
            amountPaise,
            deliverySlot: deliverySlot ?? "express",
            paymentMethod,
            address: deliveryAddressToCheckoutPayload(address),
            couponCode,
            items: isSignedIn
              ? undefined
              : cartItems.map((item) => ({
                  productSlug: item.slug,
                  quantity: item.quantity,
                })),
          },
          token
        );

        if (isCodOrderResponse(result)) {
          clearLocalCart(Boolean(isSignedIn));
          setProcessing(false);
          goToTracking(
            router,
            result.dbOrderId,
            result.orderNumber,
            address.phoneNumber,
            onPlaced
          );
          return;
        }

        const pendingOrderId = result.order.dbOrderId;
        const pendingOrderNumber = result.order.orderNumber;

        await openRazorpayCheckout({
          orderId: result.razorpayOrderId,
          amountPaise: result.amountPaise,
          currency: result.currency,
          keyId: result.keyId,
          name: address.fullName,
          phone: address.phoneNumber,
          email: user?.primaryEmailAddress?.emailAddress ?? undefined,
          description: description ?? `Order ${result.order.orderNumber}`,
          onDismiss: () => setProcessing(false),
          onFailed: (message) => {
            toast.error(message);
            setProcessing(false);
          },
          onSuccess: async (response) => {
            try {
              const verified = await verifyRazorpayPayment(
                {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                },
                token
              );
              clearLocalCart(Boolean(isSignedIn));
              setProcessing(false);
              goToTracking(
                router,
                verified.dbOrderId || pendingOrderId,
                verified.orderNumber || pendingOrderNumber,
                address.phoneNumber,
                onPlaced
              );
            } catch (e) {
              toast.error(
                e instanceof Error ? e.message : "Payment received but verification failed"
              );
            } finally {
              setProcessing(false);
            }
          },
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not complete checkout");
        setProcessing(false);
      }
    },
    [getToken, isSignedIn, router, user?.primaryEmailAddress?.emailAddress]
  );

  return { completeCheckout, processing };
}

/** @deprecated Use useCheckout */
export function useRazorpayCheckout() {
  const { completeCheckout, processing } = useCheckout();
  return {
    startPayment: (input: Omit<CheckoutInput, "paymentMethod">) =>
      completeCheckout({ ...input, paymentMethod: "online" }),
    paying: processing,
  };
}
