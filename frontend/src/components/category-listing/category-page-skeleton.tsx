import { Skeleton } from "@/components/ui/skeleton";

import { CategoryListingToolbarSkeleton } from "./category-listing-toolbar-skeleton";
import { CategoryProductGridSkeleton } from "./category-product-grid-skeleton";

type CategoryPageSkeletonProps = {
  productCount?: number;
};

export function CategoryPageSkeleton({ productCount = 8 }: CategoryPageSkeletonProps) {
  return (
    <section
      className="border-border/60 bg-neutral-50/90 border-t"
      aria-busy="true"
      aria-label="Loading category"
    >
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:space-y-6 lg:px-8 lg:py-10">
        <nav aria-hidden>
          <Skeleton className="h-4 w-48" />
        </nav>
        <CategoryListingToolbarSkeleton />
        <CategoryProductGridSkeleton count={productCount} />
      </div>
    </section>
  );
}
