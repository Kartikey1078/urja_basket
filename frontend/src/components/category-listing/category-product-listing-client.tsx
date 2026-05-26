"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { fetchProducts } from "@/lib/api-products";
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
  const showGrid = !isError && products.length > 0;
  const showEmpty = !isError && !isFetching && products.length === 0;

  return (
    <section
      className={cn("border-border/60 bg-neutral-50/90 border-t", className)}
      aria-label={`${categoryLabel} catalogue`}
    >
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:space-y-6 lg:px-8 lg:py-10">
        <CategoryBreadcrumbs categoryLabel={categoryLabel} />
        <CategoryListingToolbar
          productCount={products.length}
          sort={sort}
          onSortSelect={handleSortSelect}
          filters={filters}
          onFiltersApply={handleFiltersApply}
          priceBounds={priceBounds}
          isSortLoading={isRefetching}
          isFilterLoading={isRefetching}
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
          <p className="text-muted-foreground rounded-lg border border-dashed bg-white/60 px-4 py-10 text-center text-sm sm:text-base">
            No products match your filters. Try adjusting or clearing filters.
          </p>
        ) : null}

        {showGrid ? (
          <div className="relative">
            {isRefetching ? (
              <div
                className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-white/55 pt-16 backdrop-blur-[1px]"
                aria-live="polite"
                aria-busy="true"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-md">
                  <span className="size-4 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
                  Updating…
                </span>
              </div>
            ) : null}
            <ul
              className={cn(
                "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5",
                isRefetching && "opacity-60"
              )}
            >
              {products.map((product) => (
                <li key={product.slug}>
                  <CategoryProductCard product={product} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
