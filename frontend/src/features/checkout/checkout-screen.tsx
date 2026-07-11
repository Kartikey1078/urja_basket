"use client";

import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AddressForm } from "@/components/address/address-form";
import { AddressSelector } from "@/components/address/address-selector";
import { useCart } from "@/hooks/use-cart";
import { useAddresses } from "@/hooks/use-addresses";
import { estimateDeliveryMinutes } from "@/lib/address/geocode";
import {
  addressToFormValues,
  formValuesToDeliveryAddress,
  type AddressFormValues,
  type DeliveryAddress,
} from "@/lib/address/types";
import { CHECKOUT_RETURN_PATH, loginUrl } from "@/lib/auth-redirect";
import { formatInr } from "@/lib/cart/pricing";
import { useCheckoutStore } from "@/stores/checkout-store";

type Mode = "list" | "form";

export function CheckoutScreen() {
  const router = useRouter();
  const { isLoaded } = useAuth();
  const { items, bill, count, hydrated: cartHydrated } = useCart();
  const {
    addresses,
    loading,
    saveAddress,
    removeAddress,
    makeDefault,
    isSignedIn,
  } = useAddresses();
  const setSelectedAddressId = useCheckoutStore((s) => s.setSelectedAddressId);
  const setGuestAddress = useCheckoutStore((s) => s.setGuestAddress);
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId);

  const [mode, setMode] = useState<Mode>("list");
  const [editing, setEditing] = useState<DeliveryAddress | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    useCheckoutStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace(loginUrl(CHECKOUT_RETURN_PATH));
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!cartHydrated) return;
    if (count === 0) {
      router.replace("/cart");
    }
  }, [cartHydrated, count, router]);

  useEffect(() => {
    if (!loading && addresses.length > 0 && selectedAddressId == null) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [addresses, loading, selectedAddressId, setSelectedAddressId]);

  const handleSave = useCallback(
    async (values: AddressFormValues) => {
      setSaving(true);
      try {
        if (isSignedIn) {
          const saved = await saveAddress(values, editing?.id);
          setSelectedAddressId(saved.id);
          setGuestAddress(null);
          setMode("list");
          setEditing(null);
        } else {
          const guest = formValuesToDeliveryAddress(values, 0);
          setGuestAddress(guest);
          toast.success("Address saved for this order");
          router.push("/cart");
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not save address");
      } finally {
        setSaving(false);
      }
    },
    [editing?.id, isSignedIn, router, saveAddress, setGuestAddress, setSelectedAddressId]
  );

  const confirmCheckout = useCallback(() => {
    const selected =
      addresses.find((a) => a.id === selectedAddressId) ??
      addresses.find((a) => a.isDefault);
    if (!selected) {
      toast.error("Select a delivery address to continue");
      return;
    }
    setSelectedAddressId(selected.id);
    toast.success("Delivery address confirmed");
    router.push("/cart");
  }, [addresses, router, selectedAddressId, setSelectedAddressId]);

  const eta = estimateDeliveryMinutes();

  if (!isLoaded || !cartHydrated) {
    return (
      <div className="bg-urja-cream min-h-dvh animate-pulse p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <div className="h-10 rounded-xl bg-black/5" />
          <div className="h-40 rounded-2xl bg-black/5" />
          <div className="h-64 rounded-2xl bg-black/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-urja-cream min-h-dvh pb-32">
      <header className="border-border/60 sticky top-0 z-30 border-b bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 lg:max-w-2xl">
          <Link
            href="/cart"
            className="text-urja-forest inline-flex size-9 items-center justify-center rounded-full hover:bg-black/5"
            aria-label="Back to cart"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-urja-forest text-lg font-bold">Delivery address</h1>
            <p className="text-muted-foreground text-xs">
              {count} item{count === 1 ? "" : "s"} · {formatInr(bill.toPay)}
            </p>
          </div>
          <span className="bg-urja-forest/10 text-urja-forest inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold">
            <Clock className="size-3.5" />
            {eta} min
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-4 px-4 py-4 lg:max-w-2xl">
        {!isSignedIn ? (
          <section className="rounded-2xl border border-amber-200/80 bg-amber-50 p-4 text-sm">
            <p className="text-urja-forest font-semibold">Sign in required</p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              Sign in to save addresses and complete checkout. You&apos;ll return to your cart
              afterward.
            </p>
            <Link
              href={loginUrl(CHECKOUT_RETURN_PATH)}
              className="text-urja-forest mt-3 inline-block text-xs font-bold underline"
            >
              Sign in
            </Link>
          </section>
        ) : null}

        {mode === "list" ? (
          <>
            {isSignedIn ? (
              <AddressSelector
                addresses={addresses}
                selectedId={selectedAddressId}
                onSelect={(a) => setSelectedAddressId(a.id)}
                onAddNew={() => {
                  setEditing(null);
                  setMode("form");
                }}
                onEdit={(a) => {
                  setEditing(a);
                  setMode("form");
                }}
                onDelete={async (a) => {
                  try {
                    await removeAddress(a.id);
                    if (selectedAddressId === a.id) {
                      setSelectedAddressId(null);
                    }
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Delete failed");
                  }
                }}
                onSetDefault={async (a) => {
                  try {
                    await makeDefault(a.id);
                    setSelectedAddressId(a.id);
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Update failed");
                  }
                }}
              />
            ) : null}

            <section className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
              <div className="flex gap-2">
                <MapPin className="text-urja-forest size-5 shrink-0" />
                <div>
                  <p className="text-urja-forest text-sm font-bold">
                    {isSignedIn ? "Add another address" : "Enter delivery address"}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Use GPS or fill in manually — quick-commerce style checkout.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setMode("form");
                }}
                className="border-urja-forest/20 text-urja-forest hover:bg-urja-forest/5 mt-3 w-full rounded-xl border py-2.5 text-sm font-bold"
              >
                {isSignedIn ? "Add new address" : "Enter address"}
              </button>
            </section>

            {isSignedIn ? (
              <button
                type="button"
                onClick={confirmCheckout}
                disabled={loading || addresses.length === 0}
                className="bg-urja-forest text-urja-cream hover:opacity-92 fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-40 mx-auto max-w-lg rounded-xl py-3.5 text-sm font-bold shadow-lg transition disabled:opacity-50 lg:max-w-2xl"
              >
                Confirm &amp; return to cart
              </button>
            ) : null}
          </>
        ) : (
          <AddressForm
            initial={editing ? addressToFormValues(editing) : null}
            saving={saving}
            submitLabel={editing ? "Update address" : "Save address"}
            onSubmit={handleSave}
          />
        )}

        {mode === "form" ? (
          <button
            type="button"
            onClick={() => {
              setMode("list");
              setEditing(null);
            }}
            className="text-muted-foreground w-full text-center text-sm font-medium"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}

