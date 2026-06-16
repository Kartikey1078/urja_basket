"use client";

import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { fetchNutritionTags, fetchProducts } from "@/lib/api-products";
import type { CategoryProduct } from "@/lib/category-product-types";
import {
  EMPTY_PRODUCT_FILTERS,
  countActiveFilters,
  getPriceBoundsFromProducts,
  type ProductFilters,
} from "@/lib/category-filters";
import type { ProductSortValue } from "@/lib/category-sort";
import { cn } from "@/lib/utils";

import { CategoryBreadcrumbs } from "./category-breadcrumbs";
import { CategoryListingToolbar } from "./category-listing-toolbar";
import { CategoryProductGridSkeleton } from "./category-product-grid-skeleton";
import { CategoryProductCard } from "./category-product-card";

type CategoryProductListingClientProps = {
  categoryLabel: string;
  categorySlug: string;
  bestSellerOnly?: boolean;
  initialProducts: CategoryProduct[];
  className?: string;
};

export function CategoryProductListingClient({
  categoryLabel,
  categorySlug,
  bestSellerOnly = false,
  initialProducts,
  className,
}: CategoryProductListingClientProps) {
  const [sort, setSort] = useState<ProductSortValue | null>(null);
  const [filters, setFilters] = useState<ProductFilters>(EMPTY_PRODUCT_FILTERS);

  const priceBounds = useMemo(
    () => getPriceBoundsFromProducts(initialProducts),
    [initialProducts]
  );

  const { data: nutritionOptions = [] } = useQuery({
    queryKey: ["nutrition-tags", categorySlug],
    queryFn: () => fetchNutritionTags(categorySlug || undefined),
    staleTime: 60_000,
    retry: 2,
  });

  const hasQueryOverrides =
    sort !== null || countActiveFilters(filters) > 0;

  const {
    data: products = initialProducts,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["category-products", categorySlug, bestSellerOnly, sort, filters],
    queryFn: () =>
      fetchProducts({
        categorySlug: categorySlug || undefined,
        bestSellerOnly,
        sort: sort ?? undefined,
        filters,
      }),
    initialData: hasQueryOverrides ? undefined : initialProducts,
    placeholderData: (prev) => prev ?? initialProducts,
    staleTime: hasQueryOverrides ? 0 : Infinity,
    refetchOnMount: hasQueryOverrides,
  });

  const handleSortSelect = useCallback((next: ProductSortValue) => {
    setSort(next);
  }, []);

  const handleFiltersApply = useCallback((next: ProductFilters) => {
    setFilters(next);
  }, []);

  const isRefetching = isFetching && hasQueryOverrides;
  const isInitialLoading = isFetching && products.length === 0;
  const showLoadingGrid = isRefetching || isInitialLoading;
  const showGrid = !isError && (products.length > 0 || showLoadingGrid);
  const showEmpty = !isError && !isFetching && products.length === 0;

  return (
    <section
      className={cn("border-border/60 bg-neutral-50/90 border-t", className)}
      aria-label={`${categoryLabel} catalogue`}
    >
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:space-y-6 lg:px-8 lg:py-10">
        <CategoryBreadcrumbs categoryLabel={categoryLabel} />
        <CategoryListingToolbar
          sort={sort}
          onSortSelect={handleSortSelect}
          filters={filters}
          onFiltersApply={handleFiltersApply}
          priceBounds={priceBounds}
          nutritionOptions={nutritionOptions}
          isLoading={isRefetching || isInitialLoading}
        />

        {isError ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-900"
          >
            <p className="font-medium">Couldn&apos;t load products</p>
            <p className="mt-1 text-red-800/90">
              {error instanceof Error ? error.message : "Something went wrong. Please try again."}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 min-h-10 rounded-lg bg-red-800 px-4 text-sm font-semibold text-white hover:bg-red-900"
            >
              Retry
            </button>
          </div>
        ) : null}

        {showEmpty ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-urja-forest/20 bg-white px-6 py-12 text-center">
            <span className="bg-urja-gold/25 text-urja-forest mb-4 inline-flex size-12 items-center justify-center rounded-full">
              <SlidersHorizontal className="size-6" strokeWidth={1.75} />
            </span>
            <p className="text-urja-forest text-base font-bold">No products match</p>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              {countActiveFilters(filters) > 0
                ? "Try removing a filter or widening your price range."
                : "Nothing in this category right now. Check back soon."}
            </p>
            {countActiveFilters(filters) > 0 ? (
              <button
                type="button"
                onClick={() => handleFiltersApply(EMPTY_PRODUCT_FILTERS)}
                className="bg-urja-forest text-urja-cream hover:bg-urja-forest/90 mt-5 min-h-10 rounded-xl px-5 text-sm font-bold shadow-sm"
              >
                Clear all filters
              </button>
            ) : null}
          </div>
        ) : null}

        {showGrid ? (
          showLoadingGrid ? (
            <CategoryProductGridSkeleton count={8} />
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {products.map((product) => (
                <li key={product.slug}>
                  <CategoryProductCard product={product} />
                </li>
              ))}
            </ul>
          )
        ) : null}
      </div>
    </section>
  );
}
