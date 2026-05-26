"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

import { discountPercent, formatInr } from "@/lib/cart/pricing";
import type { CartItem } from "@/lib/cart/types";
type CartLineItemProps = {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export function CartLineItem({ item, onQuantityChange, onRemove }: CartLineItemProps) {
  const off = discountPercent(item.price, item.mrp);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-2xl border border-black/[0.06] bg-white p-3 shadow-sm sm:p-4"
    >
      <div className="flex gap-3">
        <div className="relative size-[72px] shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:size-20">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-urja-forest text-sm font-bold leading-tight sm:text-base">
                {item.name}
              </h3>
              <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">{item.subtitle}</p>
              {item.tag ? (
                <span className="bg-urja-forest/10 text-urja-forest mt-1.5 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold sm:text-xs">
                  {item.tag}
                </span>
              ) : null}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-urja-forest text-base font-bold sm:text-lg">
                {formatInr(item.price)}
              </span>
              {item.mrp > item.price ? (
                <span className="text-muted-foreground text-xs line-through sm:text-sm">
                  {formatInr(item.mrp)}
                </span>
              ) : null}
              {off > 0 ? (
                <span className="text-[#4B7E37] text-xs font-semibold">{off}% OFF</span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <div
                className="border-urja-forest/25 flex items-center rounded-lg border"
                role="group"
                aria-label={`Quantity for ${item.name}`}
              >
                <button
                  type="button"
                  onClick={() => onQuantityChange(item.quantity - 1)}
                  className="text-urja-forest hover:bg-urja-forest/5 inline-flex size-8 items-center justify-center rounded-l-lg transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="text-urja-forest min-w-8 text-center text-sm font-bold">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onQuantityChange(item.quantity + 1)}
                  className="text-urja-forest hover:bg-urja-forest/5 inline-flex size-8 items-center justify-center rounded-r-lg transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={onRemove}
                className="text-destructive hover:bg-destructive/10 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition"
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">Remove</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
