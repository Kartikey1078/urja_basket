"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useId, useRef } from "react";

import type { ProductSortValue } from "@/lib/category-sort";
import { cn } from "@/lib/utils";

import { CategorySortOptionsList } from "./category-sort-options-list";

type CategorySortPopoverProps = {
  open: boolean;
  value: ProductSortValue | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (sort: ProductSortValue) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
};

export function CategorySortPopover({
  open,
  value,
  onOpenChange,
  onSelect,
  anchorRef,
}: CategorySortPopoverProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

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

  const pick = (sort: ProductSortValue) => {
    onSelect(sort);
    close();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
          className={cn(
            "absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,18rem)]",
            "overflow-hidden rounded-2xl border border-neutral-200/90 bg-white",
            "shadow-[0_16px_48px_rgba(15,23,42,0.14)]"
          )}
        >
          <div className="border-b border-neutral-100 bg-neutral-50/80 px-4 py-3">
            <h2
              id={titleId}
              className="text-xs font-semibold tracking-wider text-neutral-500 uppercase"
            >
              Sort by
            </h2>
          </div>
          <CategorySortOptionsList value={value} onSelect={pick} variant="popover" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
