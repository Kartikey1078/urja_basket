"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useRef, type ReactNode } from "react";

import { useCart } from "@/hooks/use-cart";
import { useCartItemQuantity } from "@/hooks/use-cart-item-quantity";
import { showAddedToCartToast } from "@/lib/cart/added-to-cart-feedback";
import type { CartProductInput } from "@/lib/cart/types";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 520, damping: 34 };

type QuantityButtonProps = {
  product: CartProductInput;
  className?: string;
  compact?: boolean;
  /** Blinkit-style compact ADD chip (product grid cards). */
  chip?: boolean;
  /** Tighter chip for 3-column mobile product grids. */
  chipDense?: boolean;
  /** Slightly larger chip for overlapping product card placement. */
  chipProminent?: boolean;
  /** When false, shows a disabled Out of Stock state instead of add/stepper. */
  inStock?: boolean;
};

function StepperIconButton({
  label,
  onClick,
  children,
  compact,
  variant = "default",
  chipStyle = false,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  compact?: boolean;
  variant?: "default" | "minus";
  chipStyle?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-medium transition-colors duration-200",
        "focus-visible:ring-[#0c831f]/40 focus-visible:ring-2 focus-visible:outline-none",
        "active:scale-[0.94]",
        chipStyle
          ? cn(
              "rounded-full",
              variant === "minus"
                ? "border-2 border-[#0c831f] bg-white text-[#0c831f] hover:bg-[#f4faf5]"
                : "border-2 border-[#0c831f] bg-[#0c831f] text-white hover:bg-[#0a7020]",
              compact ? "size-8 shrink-0" : "size-10 shrink-0"
            )
          : cn(
              "rounded-lg",
              variant === "minus"
                ? "bg-urja-cream text-urja-forest hover:bg-urja-forest/8 border border-urja-forest/12"
                : "bg-urja-forest text-urja-cream shadow-[0_2px_8px_rgba(11,43,30,0.22)] hover:bg-[#0f3526] hover:shadow-[0_3px_10px_rgba(11,43,30,0.28)]",
              compact ? "size-7 sm:size-8" : "size-9 sm:size-10"
            )
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
  chip = false,
  chipDense = false,
  chipProminent = false,
  inStock = true,
}: QuantityButtonProps) {
  const chipBtn = chipProminent
    ? "flex h-12 min-w-[4.5rem] items-center justify-center rounded-full border-2 border-[#0c831f] bg-white px-3 text-[11px] font-extrabold tracking-wide text-[#0c831f] uppercase shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition hover:bg-[#f4faf5] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c831f]/30"
    : chipDense
      ? "flex h-[2.4rem] min-w-[3.4rem] items-center justify-center rounded-full border-2 border-[#0c831f] bg-white px-2 text-[10px] font-extrabold tracking-wide text-[#0c831f] uppercase shadow-[0_1px_4px_rgba(0,0,0,0.08)] transition hover:bg-[#f4faf5] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c831f]/30"
      : "flex h-12 min-w-[4.5rem] items-center justify-center rounded-full border-2 border-[#0c831f] bg-white px-3 text-[11px] font-extrabold tracking-wide text-[#0c831f] uppercase shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition hover:bg-[#f4faf5] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c831f]/30";
  const chipStepper = chipProminent
    ? "h-12 w-fit gap-0 rounded-full border-2 border-[#0c831f] bg-white px-1"
    : chipDense
      ? "h-[2.4rem] w-fit gap-0 rounded-full border-2 border-[#0c831f] bg-white px-0.5"
      : "h-12 w-fit gap-0 rounded-full border-2 border-[#0c831f] bg-white px-1";
  const router = useRouter();
  const quantity = useCartItemQuantity(product.slug, product.variantSku);
  const { addItem, increaseQuantity, decreaseQuantity, hydrated, authReady } = useCart();
  const pending = useRef(false);
  const wasZero = useRef(false);
  const disabled = !authReady;

  const run = useCallback(async (action: () => Promise<void>) => {
    if (pending.current || disabled) return;
    pending.current = true;
    try {
      await action();
    } finally {
      pending.current = false;
    }
  }, [disabled]);

  const handleAdd = () => {
    wasZero.current = quantity === 0;
    void run(async () => {
      await addItem(product, 1);
      if (wasZero.current) {
        showAddedToCartToast({
          product,
          onViewCart: () => router.push("/cart"),
        });
      }
    });
  };
  const handleIncrease = () => void run(() => increaseQuantity(product));
  const handleDecrease = () => void run(() => decreaseQuantity(product));

  const showStepper = inStock && hydrated && quantity > 0;

  if (!inStock) {
    return (
      <div className={cn(chip ? "" : "mt-auto w-full pt-0.5", className)}>
        <button
          type="button"
          disabled
          aria-label={`${product.name} is out of stock`}
          className={cn(
            "flex cursor-not-allowed items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-100 font-bold tracking-wide text-neutral-500 uppercase",
            chip
              ? chipProminent
                ? "h-12 min-w-[4.5rem] px-3 text-[11px]"
                : chipDense
                  ? "h-[2.4rem] min-w-[3.4rem] px-2 text-[10px]"
                  : "h-12 min-w-[4.5rem] px-3 text-[11px]"
              : "w-full",
            !chip && (compact ? "h-9 text-[11px] sm:h-10 sm:text-xs" : "h-11 text-xs sm:h-12 sm:text-sm")
          )}
        >
          {chip ? "—" : "Out of Stock"}
        </button>
      </div>
    );
  }

  if (chip) {
    return (
      <div className={cn("relative isolate bg-transparent", className)}>
        {!showStepper ? (
          <button type="button" onClick={handleAdd} className={chipBtn}>
            ADD
          </button>
        ) : (
          <div
            role="group"
            aria-label={`Quantity for ${product.name}`}
            className={cn(
              "flex items-center gap-0",
              chipStepper,
              "shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
            )}
          >
            <StepperIconButton
              label="Decrease quantity"
              onClick={handleDecrease}
              compact={chipDense}
              variant="minus"
              chipStyle
            >
              <Minus className={chipDense ? "size-3.5" : "size-4"} strokeWidth={3} />
            </StepperIconButton>

            <span
              className={cn(
                "shrink-0 px-0.5 text-center font-bold tabular-nums leading-none text-[#0c831f]",
                chipDense ? "min-w-[1.125rem] text-[11px]" : "min-w-[1.25rem] text-sm"
              )}
              style={{ fontFamily: "var(--font-urja-serif), ui-serif, Georgia, serif" }}
            >
              {quantity}
            </span>

            <StepperIconButton
              label="Increase quantity"
              onClick={handleIncrease}
              compact={chipDense}
              chipStyle
            >
              <Plus className={chipDense ? "size-3.5" : "size-4"} strokeWidth={3} />
            </StepperIconButton>
          </div>
        )}
      </div>
    );
  }

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
              "flex w-full items-center justify-between gap-1.5 rounded-xl border border-urja-forest/12 bg-white p-1 shadow-[0_2px_12px_rgba(11,43,30,0.1)] ring-1 ring-urja-forest/[0.04]",
              compact ? "h-9 sm:h-10" : "h-11 sm:h-12"
            )}
          >
            <StepperIconButton
              label="Decrease quantity"
              onClick={handleDecrease}
              compact={compact}
              variant="minus"
            >
              <Minus className={cn(compact ? "size-3.5" : "size-4")} strokeWidth={2.75} />
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
              <Plus className={cn(compact ? "size-3.5" : "size-4")} strokeWidth={2.75} />
            </StepperIconButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
