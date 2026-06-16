"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { PriceBounds, ProductFilters } from "@/lib/category-filters";
import {
  clearCatalogFilters,
  countCatalogFilters,
  normalizeFiltersForApi,
} from "@/lib/category-filters";
import { cn } from "@/lib/utils";

import { CategoryFilterPopover } from "./category-filter-popover";
import { CategoryFilterSheet } from "./category-filter-sheet";
import { UrjaLoader } from "@/components/ui/loader";

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

  const appliedCount = countCatalogFilters(applied);

  const handleApply = () => {
    onApply(normalizeFiltersForApi(draft, priceBounds));
  };

  const handleClear = () => {
    const next = clearCatalogFilters(applied);
    setDraft(next);
    onApply(next);
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
          "text-urja-forest relative inline-flex max-w-full items-center gap-1.5 rounded-md border bg-white/90 transition",
          "hover:border-urja-forest/25 hover:bg-white disabled:cursor-wait disabled:opacity-60",
          open ? "border-urja-forest/30 ring-1 ring-urja-gold/30" : "border-urja-forest/15",
          "px-2.5 py-1.5 text-xs font-semibold sm:px-3 sm:py-1.5"
        )}
      >
        {isLoading ? (
          <UrjaLoader size="xs" srLabel="Loading filters" />
        ) : (
          <SlidersHorizontal className="text-urja-forest/55 size-3.5 shrink-0" strokeWidth={2} />
        )}
        <span className="truncate">Filters</span>
        <ChevronDown
          className={cn(
            "text-urja-forest/45 size-3.5 shrink-0 transition-transform",
            open && "rotate-180"
          )}
          strokeWidth={2}
        />
        {appliedCount > 0 ? (
          <span className="bg-urja-gold/35 text-urja-forest ml-0.5 flex size-4 items-center justify-center rounded-full text-[9px] font-bold">
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
