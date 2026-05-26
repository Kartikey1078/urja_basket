"use client";

import type { CartProductInput } from "@/lib/cart/types";
import { cn } from "@/lib/utils";

import { QuantityButton } from "./quantity-button";

type AddToCartButtonProps = {
  product: CartProductInput;
  className?: string;
};

/** @deprecated Use QuantityButton */
export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  return <QuantityButton product={product} className={cn(className)} />;
}
