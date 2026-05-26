"use client";

import { motion } from "framer-motion";
import { Briefcase, Circle, Home, Pencil, Trash2 } from "lucide-react";

import type { DeliveryAddress } from "@/lib/address/types";
import { cn } from "@/lib/utils";

const TYPE_ICONS = {
  home: Home,
  work: Briefcase,
  other: Circle,
} as const;

type AddressCardProps = {
  address: DeliveryAddress;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
};

export function AddressCard({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  const Icon = TYPE_ICONS[address.addressType];

  return (
    <motion.article
      layout
      initial={false}
      animate={{
        scale: selected ? 1 : 1,
        boxShadow: selected
          ? "0 8px 24px rgba(0,0,0,0.08)"
          : "0 2px 8px rgba(0,0,0,0.04)",
      }}
      className={cn(
        "rounded-2xl border bg-white p-4 transition-colors",
        selected
          ? "border-urja-forest ring-2 ring-urja-forest/15"
          : "border-black/[0.06] hover:border-urja-forest/25"
      )}
    >
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="flex gap-3">
          <span
            className={cn(
              "inline-flex size-11 shrink-0 items-center justify-center rounded-xl",
              selected ? "bg-urja-forest text-urja-cream" : "bg-urja-forest/10 text-urja-forest"
            )}
          >
            <Icon className="size-5" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-urja-forest text-sm font-bold">{address.fullName}</p>
              {address.isDefault ? (
                <span className="bg-urja-forest/10 text-urja-forest rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase">
                  Default
                </span>
              ) : null}
            </div>
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-snug">
              {address.formatted}
            </p>
            <p className="text-muted-foreground mt-1.5 text-xs font-medium">
              {address.phoneNumber}
            </p>
          </div>
          <motion.span
            animate={selected ? { scale: 1.1 } : { scale: 1 }}
            className={cn(
              "mt-2 size-5 shrink-0 rounded-full border-2",
              selected ? "border-urja-forest bg-urja-forest" : "border-black/15 bg-white"
            )}
            aria-hidden
          />
        </div>
      </button>

      {(onEdit || onDelete || onSetDefault) && (
        <div className="mt-3 flex items-center gap-3 border-t border-black/[0.05] pt-3">
          {!address.isDefault && onSetDefault ? (
            <button
              type="button"
              onClick={onSetDefault}
              className="text-urja-forest text-xs font-semibold"
            >
              Set default
            </button>
          ) : null}
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="text-muted-foreground hover:text-urja-forest ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold"
            >
              <Pencil className="size-3.5" />
              Edit
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="text-destructive inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          ) : null}
        </div>
      )}
    </motion.article>
  );
}
