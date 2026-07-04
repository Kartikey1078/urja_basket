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
import { CartSection } from "@/components/cart/cart-shell";
import { CartSkeleton } from "@/components/cart/cart-skeleton";
import { UrjaOverlayLoader } from "@/components/ui/loader";
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
    <div className="min-h-dvh bg-stone-50 pb-[calc(7.5rem+env(safe-area-inset-bottom))] sm:pb-32">
      <CartHeader itemCount={count} />

      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {syncing ? (
          <p className="mb-4 rounded-xl bg-white px-4 py-3 text-center text-sm text-stone-600 shadow-sm ring-1 ring-stone-200/80">
            Syncing your cart…
          </p>
        ) : null}
        {error ? (
          <p
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {showSkeleton ? (
          <CartSkeleton />
        ) : items.length === 0 ? (
          <section className="mx-auto flex max-w-md flex-col items-center rounded-2xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-stone-200/80">
            <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#eef3ef] text-urja-forest">
              <ShoppingBag className="size-7" strokeWidth={1.25} />
            </span>
            <h2 className="text-lg font-semibold text-stone-900">Your cart is empty</h2>
            <p className="mt-2 max-w-xs text-sm text-stone-500">
              Browse the store and add fresh picks to get started.
            </p>
            <Link
              href="/categories"
              className="mt-8 inline-flex min-h-11 w-full max-w-xs items-center justify-center rounded-xl bg-urja-forest px-6 text-sm font-medium text-white transition hover:bg-urja-forest/90 sm:w-auto"
            >
              Browse categories
            </Link>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="min-w-0 space-y-5">
              <CartSection title={`Your items · ${count}`}>
                <div className="relative">
                  {loading && items.length > 0 ? (
                    <UrjaOverlayLoader label="Updating cart…" />
                  ) : null}
                  <ul
                    className={`divide-y divide-stone-100 ${loading && items.length > 0 ? "opacity-60" : ""}`}
                    aria-label="Cart items"
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      {items.map((item) => (
                        <li key={item.id}>
                          <CartLineItem
                            embedded
                            item={item}
                            onQuantityChange={(qty) => setQuantity(item.id, qty)}
                            onRemove={() => removeItem(item.id)}
                          />
                        </li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>
              </CartSection>

              <CartDeliveryBanner />

              <div className="lg:hidden">
                {addressHydrated ? (
                  <CartCheckoutFlow
                    open={checkoutOpen}
                    slot={slot}
                    onSlotChange={setSlot}
                    onOpenChange={setCheckoutOpen}
                    focusPaymentStep={focusPaymentStep}
                  />
                ) : null}
              </div>
            </div>

            <aside className="min-w-0 space-y-5 lg:sticky lg:top-[4.5rem] lg:space-y-4">
              <div className="hidden lg:block">
                {addressHydrated ? (
                  <CartCheckoutFlow
                    open={checkoutOpen}
                    slot={slot}
                    onSlotChange={setSlot}
                    onOpenChange={setCheckoutOpen}
                    focusPaymentStep={focusPaymentStep}
                  />
                ) : null}
              </div>

              <CartCouponSection />

              <div ref={billRef}>
                <CartBillSummary bill={bill} />
              </div>
            </aside>
          </div>
        )}
      </main>

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
          disabled={processing}
          onViewDetails={scrollToBill}
          onProceed={handleProceed}
        />
      ) : null}
    </div>
  );
}
