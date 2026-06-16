"use client";

import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { type ProductSortValue } from "@/lib/category-sort";
import { cn } from "@/lib/utils";

import { CategorySortPopover } from "./category-sort-popover";
import { CategorySortSheet } from "./category-sort-sheet";
import { UrjaLoader } from "@/components/ui/loader";

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

  return (
    <div ref={anchorRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={isLoading}
        onClick={toggle}
        className={cn(
          "text-urja-forest inline-flex max-w-full items-center gap-1.5 rounded-md border bg-white/90 transition",
          "hover:border-urja-forest/25 hover:bg-white disabled:cursor-wait disabled:opacity-60",
          open ? "border-urja-forest/30 ring-1 ring-urja-gold/30" : "border-urja-forest/15",
          "px-2.5 py-1.5 text-xs font-semibold sm:px-3 sm:py-1.5"
        )}
      >
        {isLoading ? (
          <UrjaLoader size="xs" srLabel="Loading sort options" />
        ) : (
          <ArrowUpDown className="text-urja-forest/55 size-3.5 shrink-0" strokeWidth={2} />
        )}
        <span className="truncate">Sort</span>
        <ChevronDown
          className={cn(
            "text-urja-forest/45 size-3.5 shrink-0 transition-transform",
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
