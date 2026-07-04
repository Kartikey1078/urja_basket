"use client";

import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

import { discountPercent, formatInr } from "@/lib/cart/pricing";
import type { CartItem } from "@/lib/cart/types";
import { cn } from "@/lib/utils";

type CartLineItemProps = {
  item: CartItem;
  embedded?: boolean;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export function CartLineItem({
  item,
  embedded,
  onQuantityChange,
  onRemove,
}: CartLineItemProps) {
  const off = discountPercent(item.price, item.mrp);
  const subtotal = item.price * item.quantity;

  return (
    <motion.article
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        embedded ? "px-4 py-4 sm:px-5" : "rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80 sm:p-5"
      )}
    >
      <div className="flex gap-3 sm:gap-4">
        <div className="relative size-[4.25rem] shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:size-20">
          <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-medium leading-snug text-stone-900 sm:text-[15px]">
                {item.name}
              </h3>
              {item.subtitle ? (
                <p className="mt-0.5 truncate text-xs text-stone-500">{item.subtitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              aria-label={`Remove ${item.name}`}
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-base font-semibold tabular-nums text-stone-900">
                  {formatInr(item.price)}
                </span>
                {item.mrp > item.price ? (
                  <span className="text-xs text-stone-400 line-through">{formatInr(item.mrp)}</span>
                ) : null}
                {off > 0 ? (
                  <span className="rounded-md bg-[#eef3ef] px-1.5 py-0.5 text-[11px] font-medium text-urja-forest">
                    {off}% off
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-stone-500">
                Line total{" "}
                <span className="font-medium tabular-nums text-stone-800">{formatInr(subtotal)}</span>
              </p>
            </div>

            <div
              className="inline-flex w-full items-center rounded-xl bg-stone-100 p-1 sm:w-auto"
              role="group"
              aria-label={`Quantity for ${item.name}`}
            >
              <button
                type="button"
                onClick={() => onQuantityChange(item.quantity - 1)}
                className="inline-flex size-10 flex-1 items-center justify-center rounded-lg bg-white text-stone-700 shadow-sm transition hover:text-stone-900 sm:flex-none sm:shadow-none"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-10 flex-1 text-center text-sm font-semibold tabular-nums text-stone-900 sm:flex-none">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => onQuantityChange(item.quantity + 1)}
                className="inline-flex size-10 flex-1 items-center justify-center rounded-lg bg-white text-stone-700 shadow-sm transition hover:text-stone-900 sm:flex-none sm:shadow-none"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
