"use client";

import { Plus } from "lucide-react";

import { AddressCard } from "@/components/address/address-card";
import type { DeliveryAddress } from "@/lib/address/types";

type AddressSelectorProps = {
  addresses: DeliveryAddress[];
  selectedId: number | null;
  onSelect: (address: DeliveryAddress) => void;
  onAddNew: () => void;
  onEdit: (address: DeliveryAddress) => void;
  onDelete: (address: DeliveryAddress) => void;
  onSetDefault: (address: DeliveryAddress) => void;
};

export function AddressSelector({
  addresses,
  selectedId,
  onSelect,
  onAddNew,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressSelectorProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-urja-forest text-sm font-bold">Saved addresses</h2>
        <button
          type="button"
          onClick={onAddNew}
          className="text-urja-forest inline-flex items-center gap-1 text-xs font-bold"
        >
          <Plus className="size-3.5" />
          Add new
        </button>
      </div>
      {addresses.length === 0 ? (
        <p className="text-muted-foreground rounded-xl border border-dashed border-black/10 bg-white px-4 py-6 text-center text-sm">
          No saved addresses yet. Add one to continue.
        </p>
      ) : (
        <ul className="space-y-3">
          {addresses.map((address) => (
            <li key={address.id}>
              <AddressCard
                address={address}
                selected={selectedId === address.id}
                onSelect={() => onSelect(address)}
                onEdit={() => onEdit(address)}
                onDelete={() => onDelete(address)}
                onSetDefault={
                  address.isDefault ? undefined : () => onSetDefault(address)
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
