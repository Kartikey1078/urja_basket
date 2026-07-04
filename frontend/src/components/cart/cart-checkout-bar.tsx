"use client";

import { ArrowRight } from "lucide-react";

import { formatInr } from "@/lib/cart/pricing";

type CartCheckoutBarProps = {
  toPay: number;
  label?: string;
  disabled?: boolean;
  onViewDetails?: () => void;
  onProceed?: () => void;
};

export function CartCheckoutBar({
  toPay,
  label = "Proceed to Checkout",
  disabled,
  onViewDetails,
  onProceed,
}: CartCheckoutBarProps) {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 rounded-t-2xl bg-white shadow-[0_-8px_32px_rgba(15,23,42,0.08)] ring-1 ring-stone-200/80 sm:rounded-none sm:shadow-[0_-4px_24px_rgba(15,23,42,0.06)]">
      <div className="mx-auto max-w-6xl px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
          <button
            type="button"
            onClick={onViewDetails}
            className="flex min-h-11 w-full items-center justify-between rounded-xl bg-stone-50 px-4 py-2 text-left sm:w-auto sm:min-w-[8.5rem] sm:flex-col sm:items-start sm:justify-center sm:bg-transparent sm:px-1"
          >
            <span className="text-[11px] font-medium uppercase tracking-wide text-stone-500">
              Total
            </span>
            <span className="text-xl font-semibold tabular-nums text-stone-900">{formatInr(toPay)}</span>
            <span className="text-xs text-urja-forest underline-offset-2 hover:underline">
              View summary
            </span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={onProceed}
            className="inline-flex min-h-12 w-full flex-1 items-center justify-center gap-2 rounded-xl bg-urja-forest px-5 text-sm font-medium text-white transition hover:bg-urja-forest/90 disabled:opacity-50 sm:min-h-11 sm:text-base"
          >
            <span className="truncate">{label}</span>
            <ArrowRight className="size-4 shrink-0" />
          </button>
        </div>
      </div>
    </footer>
  );
}
