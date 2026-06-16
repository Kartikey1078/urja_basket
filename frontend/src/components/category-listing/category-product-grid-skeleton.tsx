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
        "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5",
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
