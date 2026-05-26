"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { memo, useCallback, useRef, type ReactNode } from "react";

import { useCart } from "@/hooks/use-cart";
import { useCartItemQuantity } from "@/hooks/use-cart-item-quantity";
import type { CartProductInput } from "@/lib/cart/types";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 520, damping: 34 };

type QuantityButtonProps = {
  product: CartProductInput;
  className?: string;
  compact?: boolean;
};

function StepperIconButton({
  label,
  onClick,
  children,
  compact,
  variant = "default",
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  compact?: boolean;
  variant?: "default" | "minus";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200",
        "focus-visible:ring-urja-forest/40 focus-visible:ring-2 focus-visible:outline-none",
        "active:scale-[0.92]",
        variant === "minus"
          ? "bg-urja-cream text-urja-forest hover:bg-urja-forest/8 border border-urja-forest/12"
          : "bg-urja-forest text-urja-cream shadow-[0_2px_8px_rgba(11,43,30,0.22)] hover:bg-[#0f3526] hover:shadow-[0_3px_10px_rgba(11,43,30,0.28)]",
        compact ? "size-7 sm:size-8" : "size-9 sm:size-10"
      )}
    >
      {children}
    </button>
  );
}

export const QuantityButton = memo(function QuantityButton({
  product,
  className,
  compact = false,
}: QuantityButtonProps) {
  const quantity = useCartItemQuantity(product.slug);
  const { addItem, increaseQuantity, decreaseQuantity, hydrated } = useCart();
  const pending = useRef(false);

  const run = useCallback(async (action: () => Promise<void>) => {
    if (pending.current) return;
    pending.current = true;
    try {
      await action();
    } finally {
      pending.current = false;
    }
  }, []);

  const handleAdd = () => void run(() => addItem(product, 1));
  const handleIncrease = () => void run(() => increaseQuantity(product));
  const handleDecrease = () => void run(() => decreaseQuantity(product));

  const showStepper = hydrated && quantity > 0;

  return (
    <div className={cn("mt-auto w-full pt-0.5", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {!showStepper ? (
          <motion.button
            key="add"
            type="button"
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={spring}
            onClick={handleAdd}
            className={cn(
              "group relative flex w-full items-stretch overflow-hidden rounded-xl",
              "border-2 border-urja-forest/90 bg-white",
              "shadow-[0_2px_10px_rgba(11,43,30,0.08)]",
              "transition-all duration-300",
              "hover:border-urja-forest hover:shadow-[0_4px_16px_rgba(11,43,30,0.14)]",
              "active:scale-[0.99]",
              "focus-visible:ring-urja-forest/30 focus-visible:ring-2 focus-visible:outline-none",
              compact ? "h-9 sm:h-10" : "h-11 sm:h-12"
            )}
          >
            <span
              className={cn(
                "text-urja-forest group-hover:bg-urja-forest/6 flex flex-1 items-center justify-center font-bold tracking-wide uppercase transition-colors duration-300",
                compact ? "text-[11px] sm:text-xs" : "text-xs sm:text-sm"
              )}
            >
              {compact ? "Add" : "Add to cart"}
            </span>
            <span
              className={cn(
                "bg-urja-forest text-urja-cream group-hover:bg-[#0f3526] flex items-center justify-center transition-colors duration-300",
                compact ? "w-9 sm:w-10" : "w-11 sm:w-12"
              )}
            >
              <Plus
                className={cn(compact ? "size-4" : "size-[1.125rem]")}
                strokeWidth={2.75}
                aria-hidden
              />
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="stepper"
            layout
            role="group"
            aria-label={`Quantity for ${product.name}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={spring}
            className={cn(
              "flex w-full items-center justify-between gap-1.5 rounded-xl",
              "border border-urja-forest/12 bg-white p-1",
              "shadow-[0_2px_12px_rgba(11,43,30,0.1)]",
              "ring-1 ring-urja-forest/[0.04]",
              compact ? "h-9 sm:h-10" : "h-11 sm:h-12"
            )}
          >
            <StepperIconButton
              label="Decrease quantity"
              onClick={handleDecrease}
              compact={compact}
              variant="minus"
            >
              <Minus
                className={cn(compact ? "size-3.5" : "size-4")}
                strokeWidth={2.75}
              />
            </StepperIconButton>

            <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-1">
              <span className="text-muted-foreground text-[9px] font-medium uppercase tracking-widest leading-none">
                Qty
              </span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={quantity}
                  initial={{ opacity: 0, y: 8, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.85 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "text-urja-forest mt-0.5 font-bold tabular-nums leading-none",
                    compact ? "text-base" : "text-lg"
                  )}
                >
                  {quantity}
                </motion.span>
              </AnimatePresence>
            </div>

            <StepperIconButton
              label="Increase quantity"
              onClick={handleIncrease}
              compact={compact}
            >
              <Plus
                className={cn(compact ? "size-3.5" : "size-4")}
                strokeWidth={2.75}
              />
            </StepperIconButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
