"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { DeliveryAddress } from "@/lib/address/types";

export type PaymentMethodChoice = "online" | "cod";

type CheckoutState = {
  selectedAddressId: number | null;
  selectedAddress: DeliveryAddress | null;
  guestAddress: DeliveryAddress | null;
  paymentMethod: PaymentMethodChoice;
  paymentStepReached: boolean;
  setSelectedAddress: (address: DeliveryAddress | null) => void;
  setSelectedAddressId: (id: number | null) => void;
  setGuestAddress: (address: DeliveryAddress | null) => void;
  setPaymentMethod: (method: PaymentMethodChoice) => void;
  setPaymentStepReached: (reached: boolean) => void;
  clearCheckout: () => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      selectedAddressId: null,
      selectedAddress: null,
      guestAddress: null,
      paymentMethod: "online",
      paymentStepReached: false,
      setSelectedAddress: (address) =>
        set({
          selectedAddress: address,
          selectedAddressId: address?.id ?? null,
        }),
      setSelectedAddressId: (id) => set({ selectedAddressId: id }),
      setGuestAddress: (address) =>
        set({
          guestAddress: address,
          selectedAddress: address,
          selectedAddressId: address?.id ?? null,
        }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setPaymentStepReached: (reached) => set({ paymentStepReached: reached }),
      clearCheckout: () =>
        set({
          selectedAddressId: null,
          selectedAddress: null,
          guestAddress: null,
          paymentMethod: "online",
          paymentStepReached: false,
        }),
    }),
    {
      name: "urja-checkout-v1",
      skipHydration: true,
      partialize: (state) => ({
        selectedAddressId: state.selectedAddressId,
        selectedAddress: state.selectedAddress,
        guestAddress: state.guestAddress,
        paymentMethod: state.paymentMethod,
      }),
    }
  )
);
