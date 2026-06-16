import type { PriceBounds, ProductFilters } from "@/lib/category-filters";
import type { ProductSortValue } from "@/lib/category-sort";
import type { NutritionTagOption } from "@/lib/nutrition-filter-types";
import { cn } from "@/lib/utils";

import { CategoryFilterButton } from "./category-filter-button";
import { CategoryListingToolbarSkeleton } from "./category-listing-toolbar-skeleton";
import { CategoryNutritionFilterRow } from "./category-nutrition-filter-row";
import { CategorySortButton } from "./category-sort-button";

type CategoryListingToolbarProps = {
  sort: ProductSortValue | null;
  onSortSelect: (sort: ProductSortValue) => void;
  filters: ProductFilters;
  onFiltersApply: (filters: ProductFilters) => void;
  priceBounds: PriceBounds;
  nutritionOptions?: NutritionTagOption[];
  isLoading?: boolean;
  className?: string;
};

export function CategoryListingToolbar({
  sort,
  onSortSelect,
  filters,
  onFiltersApply,
  priceBounds,
  nutritionOptions = [],
  isLoading = false,
  className,
}: CategoryListingToolbarProps) {
  if (isLoading) {
    return <CategoryListingToolbarSkeleton className={className} />;
  }

  const showNutrition = nutritionOptions.length > 0;

  return (
    <div className={cn("space-y-0", className)}>
      <div
        className="flex items-center justify-between gap-6 sm:gap-8"
        role="toolbar"
        aria-label="Product list controls"
      >
        <CategoryFilterButton
          applied={filters}
          onApply={onFiltersApply}
          priceBounds={priceBounds}
        />
        <CategorySortButton value={sort} onSelect={onSortSelect} />
      </div>

      {showNutrition ? (
        <CategoryNutritionFilterRow
          options={nutritionOptions}
          filters={filters}
          onFiltersChange={onFiltersApply}
          className="mt-5 border-t border-emerald-200/80 pt-5 sm:mt-6 sm:pt-6"
        />
      ) : null}
    </div>
  );
}
