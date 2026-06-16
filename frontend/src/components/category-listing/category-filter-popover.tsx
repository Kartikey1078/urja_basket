"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useId, useRef } from "react";

import type { PriceBounds, ProductFilters } from "@/lib/category-filters";
import { countCatalogFilters } from "@/lib/category-filters";
import { useAnchoredPopoverPosition } from "@/hooks/use-anchored-popover-position";
import { cn } from "@/lib/utils";

import { CategoryFilterFooter, CategoryFilterPanel } from "./category-filter-panel";

type CategoryFilterPopoverProps = {
  open: boolean;
  draft: ProductFilters;
  onDraftChange: (next: ProductFilters) => void;
  priceBounds: PriceBounds;
  onOpenChange: (open: boolean) => void;
  onApply: () => void;
  onClear: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
};

export function CategoryFilterPopover({
  open,
  draft,
  onDraftChange,
  priceBounds,
  onOpenChange,
  onApply,
  onClear,
  anchorRef,
}: CategoryFilterPopoverProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const popoverStyle = useAnchoredPopoverPosition({
    open,
    anchorRef,
    panelRef,
    align: "start",
  });

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open, close, anchorRef]);

  const draftCount = countCatalogFilters(draft);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          style={popoverStyle}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
          className={cn(
            "flex w-[min(100vw-2rem,22rem)] flex-col",
            "max-h-[min(70vh,32rem)] overflow-hidden rounded-2xl border border-neutral-200/90 bg-white",
            "shadow-[0_16px_48px_rgba(15,23,42,0.14)]"
          )}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 bg-neutral-50/80 px-4 py-3">
            <h2
              id={titleId}
              className="text-xs font-semibold tracking-wider text-neutral-500 uppercase"
            >
              Filters
            </h2>
            {draftCount > 0 ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                {draftCount}
              </span>
            ) : null}
          </div>

          <CategoryFilterPanel
            draft={draft}
            onDraftChange={onDraftChange}
            priceBounds={priceBounds}
          />

          <CategoryFilterFooter
            activeCount={draftCount}
            onClear={onClear}
            onApply={() => {
              onApply();
              close();
            }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
