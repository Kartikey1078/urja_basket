"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { formatInr } from "@/lib/cart/pricing";

type CartCheckoutBarProps = {
  toPay: number;
  label?: string;
  highlight?: boolean;
  disabled?: boolean;
  onViewDetails?: () => void;
  onProceed?: () => void;
};

export function CartCheckoutBar({
  toPay,
  label = "Proceed to Checkout",
  highlight,
  disabled,
  onViewDetails,
  onProceed,
}: CartCheckoutBarProps) {
  return (
    <footer className="border-border/60 fixed right-0 bottom-0 left-0 z-40 border-t bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-lg px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:max-w-2xl">
        <p className="text-muted-foreground mb-2 text-center text-[10px]">
          Safe &amp; secure payments
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onViewDetails}
            className="min-w-0 shrink-0 text-left"
          >
            <span className="text-urja-forest block text-xl font-bold leading-none">
              {formatInr(toPay)}
            </span>
            <span className="text-urja-forest/80 mt-0.5 text-xs font-medium underline-offset-2 hover:underline">
              View bill
            </span>
          </button>
          <motion.button
            type="button"
            disabled={disabled}
            onClick={onProceed}
            whileTap={{ scale: 0.98 }}
            className={
              highlight
                ? "bg-urja-gold text-urja-forest hover:opacity-95 flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold shadow-lg transition disabled:opacity-50 sm:text-base"
                : "bg-urja-forest text-urja-cream hover:opacity-92 flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold shadow-lg transition disabled:opacity-50 sm:text-base"
            }
          >
            {label}
            <ArrowRight className="size-5" strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
