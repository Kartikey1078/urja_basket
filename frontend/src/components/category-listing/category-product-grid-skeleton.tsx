import { CATEGORY_PRODUCT_GRID_CLASS } from "@/lib/product-grid-layout";
import { cn } from "@/lib/utils";

import { CategoryProductCardSkeleton } from "./category-product-card-skeleton";

type CategoryProductGridSkeletonProps = {
  count?: number;
  className?: string;
};

export function CategoryProductGridSkeleton({
  count = 8,
  className,
}: CategoryProductGridSkeletonProps) {
  return (
    <ul
      className={cn(
        CATEGORY_PRODUCT_GRID_CLASS,
        className
      )}
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <CategoryProductCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
