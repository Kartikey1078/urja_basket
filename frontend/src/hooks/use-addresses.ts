"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  setDefaultAddress,
  updateAddress,
} from "@/lib/address/api";
import type { AddressFormValues, DeliveryAddress } from "@/lib/address/types";

export function useAddresses() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setAddresses([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Sign in required");
      const data = await fetchAddresses(token);
      setAddresses(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load addresses";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveAddress = useCallback(
    async (values: AddressFormValues, editId?: number) => {
      const token = await getToken();
      if (!token) throw new Error("Sign in required");
      const saved = editId
        ? await updateAddress(token, editId, values)
        : await createAddress(token, values);
      await load();
      toast.success(editId ? "Address updated" : "Address saved");
      return saved;
    },
    [getToken, load]
  );

  const removeAddress = useCallback(
    async (id: number) => {
      const token = await getToken();
      if (!token) throw new Error("Sign in required");
      await deleteAddress(token, id);
      await load();
      toast.success("Address removed");
    },
    [getToken, load]
  );

  const makeDefault = useCallback(
    async (id: number) => {
      const token = await getToken();
      if (!token) throw new Error("Sign in required");
      await setDefaultAddress(token, id);
      await load();
      toast.success("Default address updated");
    },
    [getToken, load]
  );

  return {
    addresses,
    loading,
    error,
    reload: load,
    saveAddress,
    removeAddress,
    makeDefault,
    isSignedIn: Boolean(isLoaded && isSignedIn),
  };
}
