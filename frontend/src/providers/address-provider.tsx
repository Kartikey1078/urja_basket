"use client";

import { createContext, useContext } from "react";

import { useAddresses } from "@/hooks/use-addresses";

type AddressContextValue = ReturnType<typeof useAddresses>;

const AddressContext = createContext<AddressContextValue | null>(null);

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const value = useAddresses();
  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}

export function useAddressContext(): AddressContextValue {
  const ctx = useContext(AddressContext);
  if (!ctx) {
    throw new Error("useAddressContext must be used within AddressProvider");
  }
  return ctx;
}
