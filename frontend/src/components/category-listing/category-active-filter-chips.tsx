"use client";

import { X } from "lucide-react";

import {
  EMPTY_PRODUCT_FILTERS,
  countActiveFilters,
  getActiveFilterChips,
  removeFilterChip,
  type ProductFilters,
} from "@/lib/category-filters";
import { cn } from "@/lib/utils";

type CategoryActiveFilterChipsProps = {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  className?: string;
};

export function CategoryActiveFilterChips({
  filters,
  onFiltersChange,
  className,
}: CategoryActiveFilterChipsProps) {
  const chips = getActiveFilterChips(filters);
  const count = countActiveFilters(filters);

  if (count === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border border-urja-forest/10 bg-urja-cream/80 px-3 py-2.5",
        className
      )}
      aria-label="Active filters"
    >
      <span className="text-urja-forest/70 hidden text-xs font-semibold uppercase tracking-wide sm:inline">
        Active
      </span>
      <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {chips.map((chip) => (
          <li key={chip.id}>
            <button
              type="button"
              onClick={() => onFiltersChange(removeFilterChip(filters, chip.id))}
              className="bg-urja-forest/8 text-urja-forest hover:bg-urja-forest/12 inline-flex max-w-full items-center gap-1 rounded-full border border-urja-forest/15 py-1 pr-2 pl-2.5 text-xs font-semibold transition"
            >
              <span className="truncate">{chip.label}</span>
              <X className="size-3 shrink-0 opacity-70" strokeWidth={2.5} aria-hidden />
              <span className="sr-only">Remove {chip.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onFiltersChange(EMPTY_PRODUCT_FILTERS)}
        className="text-urja-forest shrink-0 text-xs font-bold underline-offset-2 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
