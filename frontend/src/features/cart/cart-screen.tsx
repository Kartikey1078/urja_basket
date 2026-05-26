"use client";

import { AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { CartBillSummary } from "@/components/cart/cart-bill-summary";
import { CartCheckoutBar } from "@/components/cart/cart-checkout-bar";
import { CartCheckoutFlow } from "@/components/cart/cart-checkout-flow";
import { CartCouponSection } from "@/components/cart/cart-coupon-section";
import { CartDeliveryBanner } from "@/components/cart/cart-delivery-banner";
import { CartHeader } from "@/components/cart/cart-header";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSkeleton } from "@/components/cart/cart-skeleton";
import { useCart } from "@/hooks/use-cart";
import { useDeliveryAddress } from "@/hooks/use-delivery-address";
import { useCheckout } from "@/hooks/use-checkout";
import type { DeliverySlotId } from "@/lib/cart/types";
import { AddressProvider } from "@/providers/address-provider";
import { useCheckoutStore } from "@/stores/checkout-store";

export function CartScreen() {
  return (
    <AddressProvider>
      <CartScreenContent />
    </AddressProvider>
  );
}

function CartScreenContent() {
  const { items, count, bill, setQuantity, removeItem, loading, syncing, error, hydrated } =
    useCart();
  const { selected, hydrated: addressHydrated } = useDeliveryAddress();
  const paymentMethod = useCheckoutStore((s) => s.paymentMethod);
  const paymentStepReached = useCheckoutStore((s) => s.paymentStepReached);
  const { completeCheckout, processing } = useCheckout();
  const showSkeleton = !hydrated || (loading && items.length === 0);
  const [slot, setSlot] = useState<DeliverySlotId>("express");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [focusPaymentStep, setFocusPaymentStep] = useState(0);
  const billRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    useCheckoutStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "1") {
      setCheckoutOpen(true);
      window.history.replaceState({}, "", "/cart");
    }
  }, []);

  const scrollToBill = useCallback(() => {
    billRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleProceed = useCallback(async () => {
    if (!checkoutOpen) {
      setCheckoutOpen(true);
      return;
    }
    if (!addressHydrated) {
      return;
    }
    if (!selected) {
      toast.error("Please add and select a delivery address", {
        description: "Save your address in the section above, then continue.",
      });
      return;
    }
    if (!paymentStepReached) {
      setFocusPaymentStep((n) => n + 1);
      toast.message("Choose how to pay", {
        description: "Pick online or cash on delivery, then tap the button again.",
      });
      return;
    }
    await completeCheckout({
      amountInr: bill.toPay,
      address: selected,
      deliverySlot: slot,
      paymentMethod,
      description: `Urja Basket · ${count} item${count === 1 ? "" : "s"}`,
      onPlaced: () => setCheckoutOpen(false),
    });
  }, [
    addressHydrated,
    bill.toPay,
    checkoutOpen,
    count,
    paymentMethod,
    paymentStepReached,
    selected,
    slot,
    completeCheckout,
  ]);

  const ctaLabel = !checkoutOpen
    ? "Proceed to Checkout"
    : selected
      ? paymentMethod === "cod"
        ? "Place order"
        : "Proceed to Payment"
      : "Proceed to Checkout";

  return (
    <div className="bg-urja-cream min-h-dvh pb-40">
      <CartHeader itemCount={count} />

      <div className="mx-auto max-w-lg space-y-4 px-4 py-4 lg:max-w-2xl">
        {syncing ? (
          <p className="rounded-xl bg-urja-forest/10 text-urja-forest px-3 py-2 text-center text-sm font-medium">
            Syncing your cart to your account…
          </p>
        ) : null}
        {error ? (
          <p className="rounded-xl bg-destructive/10 text-destructive px-3 py-2 text-sm" role="alert">
            {error}
          </p>
        ) : null}

        {showSkeleton ? (
          <CartSkeleton />
        ) : items.length === 0 ? (
          <section className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white px-6 py-16 text-center">
            <ShoppingBag className="text-urja-forest/40 mb-4 size-14" strokeWidth={1.25} />
            <h2 className="text-urja-forest text-lg font-bold">Your cart is empty</h2>
            <p className="text-muted-foreground mt-2 max-w-xs text-sm">
              Add fresh fruits, dry fruits, and more to get started.
            </p>
            <Link
              href="/categories"
              className="bg-urja-forest text-urja-cream mt-6 inline-flex rounded-xl px-6 py-2.5 text-sm font-semibold transition hover:opacity-90"
            >
              Browse categories
            </Link>
          </section>
        ) : (
          <>
            <ul className="space-y-3" aria-label="Cart items">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <li key={item.id}>
                    <CartLineItem
                      item={item}
                      onQuantityChange={(qty) => setQuantity(item.id, qty)}
                      onRemove={() => removeItem(item.id)}
                    />
                  </li>
                ))}
              </AnimatePresence>
            </ul>

            {items.length > 0 ? <CartDeliveryBanner /> : null}

            <CartCouponSection />

            {addressHydrated ? (
              <CartCheckoutFlow
                open={checkoutOpen}
                slot={slot}
                onSlotChange={setSlot}
                onOpenChange={setCheckoutOpen}
                focusPaymentStep={focusPaymentStep}
              />
            ) : null}

            <div ref={billRef}>
              <CartBillSummary bill={bill} />
            </div>
          </>
        )}
      </div>

      {hydrated && items.length > 0 ? (
        <CartCheckoutBar
          toPay={bill.toPay}
          label={
            processing
              ? paymentMethod === "cod"
                ? "Placing order…"
                : "Opening payment…"
              : ctaLabel
          }
          highlight={checkoutOpen && Boolean(selected)}
          disabled={processing}
          onViewDetails={scrollToBill}
          onProceed={handleProceed}
        />
      ) : null}
    </div>
  );
}
