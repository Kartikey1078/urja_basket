"use client";

import { useAuth } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Check, ChevronRight, Clock, CreditCard, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AddressForm } from "@/components/address/address-form";
import { AddressCard } from "@/components/address/address-card";
import { useDeliveryAddress } from "@/hooks/use-delivery-address";
import { useAddressContext } from "@/providers/address-provider";
import { estimateDeliveryMinutes } from "@/lib/address/geocode";
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
        } else {
          const guest = formValuesToDeliveryAddress(values, 0);
          setGuestAddress(guest);
          setPanel("list");
          setEditing(null);
          toast.success("Address saved for this order");
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not save address");
      } finally {
        setSaving(false);
      }
    },
    [editing?.id, saveAddress, setGuestAddress, setSelectedAddress, signedIn]
  );

  const eta = estimateDeliveryMinutes();

  if (!hydrated) {
    return <div className="h-24 animate-pulse rounded-2xl bg-white/80" />;
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
            className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-black/[0.05]"
          >
            {/* Step indicator */}
            <div className="border-b border-black/[0.05] px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                {STEPS.map((s, i) => {
                  const active = step === s.id;
                  const done = step > s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        if (s.id === 1) setStep(1);
                        if (s.id === 2 && selected) setStep(2);
                        if (s.id === 3 && selected) setStep(3);
                      }}
                      className="flex min-w-0 flex-1 flex-col items-center gap-1"
                    >
                      <span
                        className={cn(
                          "flex size-7 items-center justify-center rounded-full text-xs font-bold transition",
                          done
                            ? "bg-urja-forest text-urja-cream"
                            : active
                              ? "bg-urja-forest text-urja-cream shadow-md"
                              : "bg-black/[0.06] text-muted-foreground"
                        )}
                      >
                        {done ? <Check className="size-3.5" strokeWidth={3} /> : s.id}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wide",
                          active ? "text-urja-forest" : "text-muted-foreground"
                        )}
                      >
                        {s.label}
                      </span>
                      {i < STEPS.length - 1 ? (
                        <span className="absolute hidden" aria-hidden />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="thin-scrollbar max-h-[min(72vh,36rem)] overflow-y-auto overscroll-contain p-4">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step-address"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-urja-forest text-base font-bold">Delivery address</h2>
                      <span className="bg-urja-forest/10 text-urja-forest inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold">
                        <Clock className="size-3" />
                        {eta} min
                      </span>
                    </div>

                    {addressError ? (
                      <p
                        className="rounded-xl bg-destructive/10 text-destructive px-3 py-2 text-xs"
                        role="alert"
                      >
                        {addressError}. You can still add an address below, or sign in after
                        starting MySQL and running{" "}
                        <code className="font-mono text-[10px]">npm run db:migrate</code> in{" "}
                        <code className="font-mono text-[10px]">server/</code>.
                      </p>
                    ) : null}

                    {!signedIn ? (
                      <p className="text-muted-foreground rounded-xl bg-amber-50 px-3 py-2 text-xs">
                        <Link href="/login" className="text-urja-forest font-semibold underline">
                          Sign in
                        </Link>{" "}
                        to save addresses for next time.
                      </p>
                    ) : null}

                    {selected && panel !== "form" && panel !== "list" ? (
                      <motion.div layout>
                        <AddressCard
                          address={selected}
                          selected
                          onSelect={() => setPanel("list")}
                          onEdit={() => {
                            setEditing(selected);
                            setPanel("form");
                          }}
                        />
                      </motion.div>
                    ) : null}

                    <AnimatePresence mode="wait">
                      {panel === "form" ? (
                        <motion.div
                          key="form"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <AddressForm
                            embedded
                            initial={editing ? addressToFormValues(editing) : null}
                            saving={saving}
                            submitLabel={editing ? "Update address" : "Save address"}
                            onCancel={() => {
                              setPanel("list");
                              setEditing(null);
                            }}
                            onSubmit={handleSave}
                          />
                        </motion.div>
                      ) : panel === "list" ? (
                        <motion.div
                          key="list"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-3"
                        >
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
                            }}
                            className="border-urja-forest/20 text-urja-forest hover:bg-urja-forest/5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3.5 text-sm font-bold transition"
                          >
                            <Plus className="size-4" />
                            Add new address
                          </button>

                          {selected ? (
                            <button
                              type="button"
                              onClick={() => setStep(2)}
                              className="bg-urja-forest text-urja-cream flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold shadow-md"
                            >
                              Continue to delivery time
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
                    <h2 className="text-urja-forest text-base font-bold">Delivery time</h2>
                    <CartDeliverySlots selected={slot} onSelect={onSlotChange} />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 rounded-2xl border border-black/10 py-3 text-sm font-bold text-urja-forest"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="bg-urja-forest text-urja-cream flex-[2] rounded-2xl py-3 text-sm font-bold shadow-md"
                      >
                        Continue
                      </button>
                    </div>
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
                      <h2 className="text-urja-forest text-base font-bold">How would you like to pay?</h2>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Delivering to{" "}
                        <span className="text-urja-forest font-semibold">{selected?.city}</span>
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("online")}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition",
                          paymentMethod === "online"
                            ? "border-urja-forest bg-urja-forest/5"
                            : "border-black/8 bg-white"
                        )}
                      >
                        <span className="bg-urja-forest/10 text-urja-forest flex size-10 shrink-0 items-center justify-center rounded-full">
                          <CreditCard className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-urja-forest block text-sm font-bold">Pay online</span>
                          <span className="text-muted-foreground text-xs">UPI, card, netbanking via Razorpay</span>
                        </span>
                        {paymentMethod === "online" ? (
                          <Check className="text-urja-forest size-5 shrink-0" />
                        ) : null}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cod")}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition",
                          paymentMethod === "cod"
                            ? "border-urja-forest bg-urja-forest/5"
                            : "border-black/8 bg-white"
                        )}
                      >
                        <span className="bg-urja-forest/10 text-urja-forest flex size-10 shrink-0 items-center justify-center rounded-full">
                          <Banknote className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-urja-forest block text-sm font-bold">Cash on delivery</span>
                          <span className="text-muted-foreground text-xs">
                            Pay when your order arrives — no online payment now
                          </span>
                        </span>
                        {paymentMethod === "cod" ? (
                          <Check className="text-urja-forest size-5 shrink-0" />
                        ) : null}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex-1 rounded-2xl border border-black/10 py-3 text-sm font-bold text-urja-forest"
                      >
                        Back
                      </button>
                    </div>
                    <p className="text-muted-foreground text-center text-xs">
                      Tap <span className="font-semibold text-urja-forest">Place order</span> below when
                      ready
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm"
          >
            {selected ? (
              <button
                type="button"
                onClick={() => onOpenChange(true)}
                className="w-full text-left"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-urja-forest text-sm font-bold">Delivery address</span>
                  <span className="text-urja-forest text-xs font-semibold">Change</span>
                </div>
                <p className="text-urja-forest text-sm font-semibold">{selected.fullName}</p>
                <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
                  {selected.formatted}
                </p>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenChange(true)}
                className="flex w-full items-center gap-3 text-left"
              >
                <span className="bg-urja-forest/10 text-urja-forest flex size-10 items-center justify-center rounded-full">
                  <MapPin className="size-5" />
                </span>
                <span>
                  <span className="text-urja-forest block text-sm font-bold">
                    Add delivery address
                  </span>
                  <span className="text-muted-foreground text-xs">Tap to continue checkout</span>
                </span>
                <ChevronRight className="text-urja-forest ml-auto size-5" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
