"use client";

import { Salad } from "lucide-react";

import { NutritionOptionTile } from "@/components/category-listing/nutrition-option-tile";
import { selectNutritionTag, type ProductFilters } from "@/lib/category-filters";
import type { NutritionTagOption } from "@/lib/nutrition-filter-types";
import { cn } from "@/lib/utils";

type CategoryNutritionFilterRowProps = {
  options: NutritionTagOption[];
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  isLoading?: boolean;
  className?: string;
};

export function CategoryNutritionFilterRow({
  options,
  filters,
  onFiltersChange,
  isLoading = false,
  className,
}: CategoryNutritionFilterRowProps) {
  if (options.length === 0) return null;

  const activeTag = filters.nutritionTag;

  return (
    <section className={cn("space-y-3 sm:space-y-3.5", className)} aria-label="Nutrition filters">
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 sm:size-8">
          <Salad className="size-3.5 sm:size-4" strokeWidth={2} aria-hidden />
        </span>
        <p className="text-xs font-bold tracking-wider text-emerald-900 uppercase sm:text-[13px]">
          Shop by nutrition
        </p>
      </div>

      <div className="thin-scrollbar -mx-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain px-1 pb-0.5 md:-mx-0 md:overflow-visible md:px-0 md:pb-0">
        <ul className="flex w-max min-w-full flex-nowrap items-start gap-3 sm:gap-4 md:w-full md:flex-wrap md:justify-start lg:gap-5">
          {options.map((option) => (
            <li key={option.slug} className="shrink-0 md:shrink">
              <NutritionOptionTile
                option={option}
                selected={activeTag === option.name}
                disabled={isLoading}
                onSelect={() =>
                  onFiltersChange(selectNutritionTag(filters, option.name))
                }
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
