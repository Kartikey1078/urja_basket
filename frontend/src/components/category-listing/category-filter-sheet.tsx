"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useCallback, useEffect, useId, useRef } from "react";

import type { PriceBounds, ProductFilters } from "@/lib/category-filters";
import { countCatalogFilters } from "@/lib/category-filters";
import { cn } from "@/lib/utils";

import { CategoryFilterFooter, CategoryFilterPanel } from "./category-filter-panel";

const DISMISS_DRAG_PX = 80;
const DISMISS_VELOCITY = 420;

type CategoryFilterSheetProps = {
  open: boolean;
  draft: ProductFilters;
  onDraftChange: (next: ProductFilters) => void;
  priceBounds: PriceBounds;
  onOpenChange: (open: boolean) => void;
  onApply: () => void;
  onClear: () => void;
};

export function CategoryFilterSheet({
  open,
  draft,
  onDraftChange,
  priceBounds,
  onOpenChange,
  onApply,
  onClear,
}: CategoryFilterSheetProps) {
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > DISMISS_DRAG_PX || info.velocity.y > DISMISS_VELOCITY) {
      close();
    }
  };

  const draftCount = countCatalogFilters(draft);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col justify-end md:hidden"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            aria-label="Close filters"
            onClick={close}
          />

          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.35 }}
            onDragEnd={handleDragEnd}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 380, mass: 0.85 }}
            className={cn(
              "relative z-[101] flex max-h-[78vh] min-h-[55vh] w-full flex-col",
              "rounded-t-[1.75rem] border border-neutral-200/80 bg-white",
              "shadow-[0_-12px_40px_rgba(15,23,42,0.12)]"
            )}
            style={{ touchAction: "none" }}
          >
            <div
              className="flex shrink-0 cursor-grab flex-col items-center pt-3 pb-1 active:cursor-grabbing"
              aria-hidden
            >
              <span className="h-1 w-10 rounded-full bg-neutral-300" />
            </div>

            <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-5 pb-3 pt-1">
              <h2 id={titleId} className="text-base font-semibold tracking-tight text-neutral-900">
                Filters
              </h2>
              {draftCount > 0 ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  {draftCount} selected
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
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
