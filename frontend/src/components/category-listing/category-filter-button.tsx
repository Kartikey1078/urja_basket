"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { PriceBounds, ProductFilters } from "@/lib/category-filters";
import {
  EMPTY_PRODUCT_FILTERS,
  countActiveFilters,
  getFilterSummary,
  normalizeFiltersForApi,
} from "@/lib/category-filters";
import { cn } from "@/lib/utils";

import { CategoryFilterPopover } from "./category-filter-popover";
import { CategoryFilterSheet } from "./category-filter-sheet";

const DESKTOP_MQ = "(min-width: 768px)";

type CategoryFilterButtonProps = {
  applied: ProductFilters;
  onApply: (filters: ProductFilters) => void;
  priceBounds: PriceBounds;
  isLoading?: boolean;
  className?: string;
};

export function CategoryFilterButton({
  applied,
  onApply,
  priceBounds,
  isLoading = false,
  className,
}: CategoryFilterButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [draft, setDraft] = useState<ProductFilters>(applied);
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const toggle = useCallback(() => {
    setOpen((wasOpen) => {
      if (!wasOpen) setDraft(applied);
      return !wasOpen;
    });
  }, [applied]);

  const appliedCount = countActiveFilters(applied);
  const summary = getFilterSummary(applied);

  const handleApply = () => {
    onApply(normalizeFiltersForApi(draft, priceBounds));
  };

  const handleClear = () => {
    setDraft(EMPTY_PRODUCT_FILTERS);
    onApply(EMPTY_PRODUCT_FILTERS);
  };

  return (
    <div ref={anchorRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={isLoading}
        onClick={toggle}
        className={cn(
          "text-foreground relative inline-flex max-w-full items-center gap-2 rounded-lg border bg-white shadow-sm transition",
          "hover:bg-neutral-50 disabled:cursor-wait disabled:opacity-60",
          open ? "border-emerald-600/40 ring-2 ring-emerald-600/15" : "border-neutral-300",
          "px-3 py-2 text-sm font-medium md:min-h-10 md:px-4 md:py-2.5"
        )}
      >
        <SlidersHorizontal
          className={cn("text-muted-foreground size-4 shrink-0", isLoading && "animate-pulse")}
          strokeWidth={1.75}
        />
        <span className="md:hidden">Filters</span>
        <span className="hidden min-w-0 flex-col items-start gap-0.5 text-left leading-tight md:flex">
          <span className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
            Filters
          </span>
          <span className="max-w-[11rem] truncate font-semibold text-neutral-900">{summary}</span>
        </span>
        <ChevronDown
          className={cn(
            "text-muted-foreground hidden size-4 shrink-0 transition-transform md:block",
            open && "rotate-180"
          )}
          strokeWidth={2}
        />
        {appliedCount > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-bold text-white md:static md:ml-0.5 md:size-auto md:rounded-full md:px-2 md:py-0.5 md:text-[10px]">
            {appliedCount}
          </span>
        ) : null}
      </button>

      {isDesktop ? (
        <CategoryFilterPopover
          open={open}
          draft={draft}
          onDraftChange={setDraft}
          priceBounds={priceBounds}
          onOpenChange={setOpen}
          onApply={handleApply}
          onClear={handleClear}
          anchorRef={anchorRef}
        />
      ) : (
        <CategoryFilterSheet
          open={open}
          draft={draft}
          onDraftChange={setDraft}
          priceBounds={priceBounds}
          onOpenChange={setOpen}
          onApply={handleApply}
          onClear={handleClear}
        />
      )}
    </div>
  );
}
