"use client";

import { useAuth } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Check, ChevronDown, ChevronRight, CreditCard, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AddressForm } from "@/components/address/address-form";
import { AddressCard } from "@/components/address/address-card";
import { useDeliveryAddress } from "@/hooks/use-delivery-address";
import { useAddressContext } from "@/providers/address-provider";
import {
  addressToFormValues,
  formValuesToDeliveryAddress,
  type AddressFormValues,
  type DeliveryAddress,
} from "@/lib/address/types";
import type { DeliverySlotId } from "@/lib/cart/types";
import { useCheckoutStore } from "@/stores/checkout-store";
import { cn } from "@/lib/utils";

import { CartDeliverySlots } from "./cart-delivery-slots";
import { cartCardClass } from "./cart-shell";

type CheckoutStep = 1 | 2 | 3;
type AddressPanel = "collapsed" | "list" | "form";

type CartCheckoutFlowProps = {
  open: boolean;
  slot: DeliverySlotId;
  onSlotChange: (id: DeliverySlotId) => void;
  onOpenChange: (open: boolean) => void;
  /** Parent bumps this to jump user to the Pay step */
  focusPaymentStep?: number;
};

const STEPS = [
  { id: 1 as const, label: "Address" },
  { id: 2 as const, label: "Time" },
  { id: 3 as const, label: "Pay" },
];

export function CartCheckoutFlow({
  open,
  slot,
  onSlotChange,
  onOpenChange,
  focusPaymentStep = 0,
}: CartCheckoutFlowProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { isLoaded, isSignedIn } = useAuth();
  const { selected, hydrated } = useDeliveryAddress();
  const {
    addresses,
    loading,
    error: addressError,
    saveAddress,
    removeAddress,
    makeDefault,
    isSignedIn: addressesReady,
  } = useAddressContext();
  const setSelectedAddress = useCheckoutStore((s) => s.setSelectedAddress);
  const setGuestAddress = useCheckoutStore((s) => s.setGuestAddress);
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId);
  const paymentMethod = useCheckoutStore((s) => s.paymentMethod);
  const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);

  const [step, setStep] = useState<CheckoutStep>(1);
  const [panel, setPanel] = useState<AddressPanel>("collapsed");
  const [editing, setEditing] = useState<DeliveryAddress | null>(null);
  const [saving, setSaving] = useState(false);
  const [checkoutDetailsOpen, setCheckoutDetailsOpen] = useState(true);

  const signedIn = isLoaded && isSignedIn && addressesReady;

  useEffect(() => {
    if (!loading && addresses.length > 0 && selectedAddressId == null) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      setSelectedAddress(def);
    }
  }, [addresses, loading, selectedAddressId, setSelectedAddress]);

  useEffect(() => {
    if (open && sectionRef.current) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }, [open]);

  const setPaymentStepReached = useCheckoutStore((s) => s.setPaymentStepReached);

  useEffect(() => {
    if (open) {
      setStep(1);
      setPaymentStepReached(false);
      setCheckoutDetailsOpen(true);
      if (!selected && addresses.length === 0) {
        setPanel("form");
      } else {
        setPanel("list");
      }
    } else {
      setPanel("collapsed");
      setEditing(null);
      setPaymentStepReached(false);
    }
  }, [open, selected, addresses.length, setPaymentStepReached]);

  useEffect(() => {
    if (step === 3) {
      setPaymentStepReached(true);
    }
  }, [step, setPaymentStepReached]);

  useEffect(() => {
    if (focusPaymentStep > 0 && open) {
      setStep(3);
      setPanel("list");
      setPaymentStepReached(true);
    }
  }, [focusPaymentStep, open, setPaymentStepReached]);

  useEffect(() => {
    if (panel === "form") {
      setCheckoutDetailsOpen(true);
    }
  }, [panel]);

  const goToStep = useCallback(
    (target: CheckoutStep) => {
      if ((target === 2 || target === 3) && !selected) {
        toast.error("Add a delivery address first");
        return;
      }
      setStep(target);
      if (target === 1) {
        setEditing(null);
        setPanel(selected || addresses.length > 0 ? "list" : "form");
      }
    },
    [addresses.length, selected]
  );

  const handleSave = useCallback(
    async (values: AddressFormValues) => {
      setSaving(true);
      try {
        if (signedIn) {
          const saved = await saveAddress(values, editing?.id);
          setSelectedAddress(saved);
          setGuestAddress(null);
          setPanel("list");
          setEditing(null);
          toast.success("Address saved");
          setStep(2);
        } else {
          const guest = formValuesToDeliveryAddress(values, 0);
          setGuestAddress(guest);
          setPanel("list");
          setEditing(null);
          toast.success("Address saved for this order");
          setStep(2);
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not save address");
      } finally {
        setSaving(false);
      }
    },
    [editing?.id, saveAddress, setGuestAddress, setSelectedAddress, signedIn]
  );

  const checkoutSubtitle =
    step === 2
      ? "Choose delivery time"
      : step === 3
        ? "Select payment method"
        : selected?.formatted
          ? selected.formatted
          : editing
            ? "Update your delivery details"
            : "Quick — only 4 fields";

  const isAddressForm = checkoutDetailsOpen && step === 1 && panel === "form";

  if (!hydrated) {
    return <div className="h-24 animate-pulse rounded-2xl bg-stone-100" />;
  }

  return (
    <div ref={sectionRef} className="space-y-4">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className={cartCardClass}
          >
            <button
              type="button"
              onClick={() => setCheckoutDetailsOpen((v) => !v)}
              className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:min-h-11 sm:px-5"
              aria-expanded={checkoutDetailsOpen}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#eef3ef] text-urja-forest">
                  <MapPin className="size-4" strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-stone-900">
                    {selected
                      ? selected.fullName
                      : editing
                        ? "Edit delivery address"
                        : "Add delivery address"}
                  </span>
                  <span className="block truncate text-xs text-stone-500">{checkoutSubtitle}</span>
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "size-5 shrink-0 text-stone-400 transition",
                  checkoutDetailsOpen && "rotate-180"
                )}
              />
            </button>

            {checkoutDetailsOpen ? (
              <>
                <div className="border-t border-stone-100 px-4 py-3 sm:px-5">
                  <div
                    className="flex rounded-xl bg-stone-100 p-1"
                    role="tablist"
                    aria-label="Checkout steps"
                  >
                    {STEPS.map((s) => {
                      const active = step === s.id;
                      const done = step > s.id;
                      const locked = (s.id === 2 || s.id === 3) && !selected;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          disabled={locked}
                          onClick={() => goToStep(s.id)}
                          className={cn(
                            "flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold uppercase tracking-wide transition sm:min-h-9 sm:text-xs",
                            active && "bg-urja-forest text-white shadow-sm",
                            !active && done && "bg-[#eef3ef] text-urja-forest",
                            !active && !done && !locked && "text-stone-600 hover:text-stone-900",
                            locked && "cursor-not-allowed text-stone-400 opacity-60"
                          )}
                        >
                          {done && !active ? (
                            <Check className="size-3.5 shrink-0" strokeWidth={2.5} />
                          ) : (
                            <span
                              className={cn(
                                "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                                active && "bg-white/25 text-white",
                                !active && done && "bg-urja-forest/15 text-urja-forest",
                                !active && !done && "bg-stone-200 text-stone-600"
                              )}
                            >
                              {s.id}
                            </span>
                          )}
                          <span className="truncate">{s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  className={cn(
                    "border-t border-stone-100 p-4 sm:p-5",
                    !isAddressForm &&
                      "thin-scrollbar max-h-[min(70vh,32rem)] overflow-y-auto overscroll-contain"
                  )}
                >
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step-address"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="space-y-4"
                  >
                    <AnimatePresence mode="wait">
                      {panel === "form" ? (
                        <div key="form" className="space-y-3">
                          {addressError ? (
                            <p
                              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
                              role="alert"
                            >
                              Could not load saved addresses. You can still enter one below.
                            </p>
                          ) : null}

                          {!signedIn ? (
                            <p className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-600">
                              <Link href="/login" className="font-medium text-urja-forest underline">
                                Sign in
                              </Link>{" "}
                              to reuse saved addresses next time.
                            </p>
                          ) : null}

                          <AddressForm
                            embedded
                            initial={editing ? addressToFormValues(editing) : null}
                            saving={saving}
                            submitLabel={editing ? "Update & continue" : "Save & continue"}
                            onSubmit={handleSave}
                          />
                        </div>
                      ) : panel === "list" ? (
                        <motion.div
                          key="list"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-3"
                        >
                          <h2 className="text-base font-medium text-stone-900">
                            Where should we deliver?
                          </h2>
                          {signedIn && addresses.length > 0 ? (
                            <ul className="thin-scrollbar max-h-72 space-y-2 overflow-y-auto overscroll-contain pr-1">
                              {addresses.map((addr) => (
                                <li key={addr.id}>
                                  <AddressCard
                                    address={addr}
                                    selected={Number(selectedAddressId) === Number(addr.id)}
                                    onSelect={() => {
                                      setSelectedAddress(addr);
                                      setGuestAddress(null);
                                    }}
                                    onEdit={() => {
                                      setEditing(addr);
                                      setPanel("form");
                                      setCheckoutDetailsOpen(true);
                                    }}
                                    onDelete={async () => {
                                      try {
                                        await removeAddress(addr.id);
                                        if (Number(selectedAddressId) === Number(addr.id)) {
                                          setSelectedAddress(null);
                                        }
                                      } catch (e) {
                                        toast.error(
                                          e instanceof Error ? e.message : "Delete failed"
                                        );
                                      }
                                    }}
                                    onSetDefault={
                                      addr.isDefault
                                        ? undefined
                                        : async () => {
                                            await makeDefault(addr.id);
                                            setSelectedAddress(addr);
                                          }
                                    }
                                  />
                                </li>
                              ))}
                            </ul>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => {
                              setEditing(null);
                              setPanel("form");
                              setCheckoutDetailsOpen(true);
                            }}
                            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-stone-50 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 sm:min-h-11"
                          >
                            <Plus className="size-4" />
                            Add address
                          </button>

                          {selected ? (
                            <button
                              type="button"
                              onClick={() => setStep(2)}
                              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-urja-forest text-sm font-medium text-white sm:min-h-11"
                            >
                              Choose delivery time
                              <ChevronRight className="size-4" />
                            </button>
                          ) : null}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>
                ) : null}

                {step === 2 ? (
                  <motion.div
                    key="step-time"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="space-y-4"
                  >
                    <h2 className="text-base font-medium text-stone-900">When should we deliver?</h2>
                    <CartDeliverySlots selected={slot} onSelect={onSlotChange} />
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-urja-forest text-sm font-medium text-white sm:min-h-11"
                    >
                      Continue
                    </button>
                  </motion.div>
                ) : null}

                {step === 3 ? (
                  <motion.div
                    key="step-pay"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <h2 className="text-base font-medium text-stone-900">Payment method</h2>
                      <p className="mt-1 text-sm text-stone-600">
                        Delivering to{" "}
                        <span className="font-medium text-stone-900">{selected?.city}</span>
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("online")}
                        className={cn(
                          "flex min-h-14 items-center gap-3 rounded-xl border p-3.5 text-left transition sm:min-h-[3.75rem]",
                          paymentMethod === "online"
                            ? "border-urja-forest bg-[#eef3ef]"
                            : "border-stone-200 bg-stone-50 hover:border-stone-300"
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-md",
                            paymentMethod === "online"
                              ? "bg-urja-forest text-white"
                              : "bg-stone-100 text-stone-600"
                          )}
                        >
                          <CreditCard className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-stone-900">Pay online</span>
                          <span className="text-xs text-stone-500">UPI, card, netbanking</span>
                        </span>
                        {paymentMethod === "online" ? (
                          <Check className="size-5 shrink-0 text-urja-forest" />
                        ) : null}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cod")}
                        className={cn(
                          "flex min-h-14 items-center gap-3 rounded-xl border p-3.5 text-left transition sm:min-h-[3.75rem]",
                          paymentMethod === "cod"
                            ? "border-urja-forest bg-[#eef3ef]"
                            : "border-stone-200 bg-stone-50 hover:border-stone-300"
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-md",
                            paymentMethod === "cod"
                              ? "bg-urja-forest text-white"
                              : "bg-stone-100 text-stone-600"
                          )}
                        >
                          <Banknote className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-stone-900">Cash on delivery</span>
                          <span className="text-xs text-stone-500">Pay when order arrives</span>
                        </span>
                        {paymentMethod === "cod" ? (
                          <Check className="size-5 shrink-0 text-urja-forest" />
                        ) : null}
                      </button>
                    </div>

                    <p className="text-center text-xs text-stone-500">
                      Tap <span className="font-medium text-stone-800">Place order</span> below when
                      ready
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
                </div>
              </>
            ) : null}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${cartCardClass} p-4 sm:p-5`}
          >
            {selected ? (
              <button
                type="button"
                onClick={() => onOpenChange(true)}
                className="w-full text-left"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-stone-900">Delivery address</span>
                  <span className="text-xs font-medium text-urja-forest">Change</span>
                </div>
                <p className="text-sm font-medium text-stone-900">{selected.fullName}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-stone-600">{selected.formatted}</p>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenChange(true)}
                className="flex min-h-12 w-full items-center gap-3 text-left sm:min-h-11"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3ef] text-urja-forest">
                  <MapPin className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-stone-900">Add delivery address</span>
                  <span className="text-xs text-stone-500">Quick — only 4 fields</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-stone-400" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
