"use client";

import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { getSortOptionLabel, type ProductSortValue } from "@/lib/category-sort";
import { cn } from "@/lib/utils";

import { CategorySortPopover } from "./category-sort-popover";
import { CategorySortSheet } from "./category-sort-sheet";

const DESKTOP_MQ = "(min-width: 768px)";

type CategorySortButtonProps = {
  value: ProductSortValue | null;
  onSelect: (sort: ProductSortValue) => void;
  isLoading?: boolean;
  className?: string;
};

export function CategorySortButton({
  value,
  onSelect,
  isLoading = false,
  className,
}: CategorySortButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const activeLabel = getSortOptionLabel(value);

  return (
    <div ref={anchorRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={isLoading}
        onClick={toggle}
        className={cn(
          "text-foreground inline-flex max-w-full items-center gap-2 rounded-lg border bg-white shadow-sm transition",
          "hover:bg-neutral-50 disabled:cursor-wait disabled:opacity-60",
          open ? "border-emerald-600/40 ring-2 ring-emerald-600/15" : "border-neutral-300",
          "px-3 py-2 text-sm font-medium md:min-h-10 md:px-4 md:py-2.5"
        )}
      >
        <ArrowUpDown
          className={cn("text-muted-foreground size-4 shrink-0", isLoading && "animate-pulse")}
          strokeWidth={1.75}
        />
        <span className="md:hidden">Sort</span>
        <span className="hidden min-w-0 flex-col items-start gap-0.5 text-left leading-tight md:flex">
          <span className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
            Sort
          </span>
          <span className="max-w-[11rem] truncate font-semibold text-neutral-900">
            {activeLabel ?? "Default"}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "text-muted-foreground hidden size-4 shrink-0 transition-transform md:block",
            open && "rotate-180"
          )}
          strokeWidth={2}
        />
      </button>

      {isDesktop ? (
        <CategorySortPopover
          open={open}
          value={value}
          onOpenChange={setOpen}
          onSelect={onSelect}
          anchorRef={anchorRef}
        />
      ) : (
        <CategorySortSheet open={open} value={value} onOpenChange={setOpen} onSelect={onSelect} />
      )}
    </div>
  );
}
