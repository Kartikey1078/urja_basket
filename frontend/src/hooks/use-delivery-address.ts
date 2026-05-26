"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";

import { useAddressContext } from "@/providers/address-provider";
import type { DeliveryAddress } from "@/lib/address/types";
import { useCheckoutStore } from "@/stores/checkout-store";

function sameAddressId(a: number | null | undefined, b: number | null | undefined): boolean {
  if (a == null || b == null) return false;
  return Number(a) === Number(b);
}

function resolveFromList(
  addresses: DeliveryAddress[],
  id: number | null,
  snapshot: DeliveryAddress | null
): DeliveryAddress | null {
  if (id != null) {
    const fromList = addresses.find((a) => sameAddressId(a.id, id));
    if (fromList) return fromList;
    if (snapshot && sameAddressId(snapshot.id, id)) return snapshot;
  }
  const def = addresses.find((a) => a.isDefault) ?? addresses[0];
  if (def) return def;
  if (snapshot) return snapshot;
  return null;
}

export function useDeliveryAddress() {
  const { isSignedIn } = useAuth();
  const { addresses, loading } = useAddressContext();
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId);
  const selectedAddress = useCheckoutStore((s) => s.selectedAddress);
  const guestAddress = useCheckoutStore((s) => s.guestAddress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useCheckoutStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useCheckoutStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  // When address list loads, refresh snapshot if we have a matching id
  useEffect(() => {
    if (!selectedAddressId || addresses.length === 0) return;
    const fresh = addresses.find((a) => sameAddressId(a.id, selectedAddressId));
    if (fresh && fresh !== selectedAddress) {
      useCheckoutStore.getState().setSelectedAddress(fresh);
    }
  }, [addresses, selectedAddressId, selectedAddress]);

  const selected = useMemo((): DeliveryAddress | null => {
    if (!hydrated) return null;

    if (guestAddress && (!isSignedIn || guestAddress.id === 0)) {
      return guestAddress;
    }

    return resolveFromList(addresses, selectedAddressId, selectedAddress);
  }, [
    addresses,
    guestAddress,
    hydrated,
    isSignedIn,
    selectedAddress,
    selectedAddressId,
  ]);

  return {
    selected,
    loading: loading && isSignedIn,
    hydrated,
    addresses,
    isSignedIn,
  };
}
