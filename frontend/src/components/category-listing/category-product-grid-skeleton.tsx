import {
  CATEGORY_PRODUCT_GRID_CLASS,
  HAMPER_LISTING_GRID_CLASS,
} from "@/lib/product-grid-layout";
import { cn } from "@/lib/utils";

import { CategoryProductCardSkeleton } from "./category-product-card-skeleton";
import { PremiumHamperProductCardSkeleton } from "./premium-hamper-product-card-skeleton";

type CategoryProductGridSkeletonProps = {
  count?: number;
  variant?: "default" | "hamper";
  /** Gift hamper cards use a 1:1 image area. */
  squareHamperImage?: boolean;
  className?: string;
};

export function CategoryProductGridSkeleton({
  count = 8,
  variant = "default",
  squareHamperImage = false,
  className,
}: CategoryProductGridSkeletonProps) {
  const gridClass =
    variant === "hamper" ? HAMPER_LISTING_GRID_CLASS : CATEGORY_PRODUCT_GRID_CLASS;

  return (
    <ul
      className={cn(gridClass, className)}
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          {variant === "hamper" ? (
            <PremiumHamperProductCardSkeleton squareImage={squareHamperImage} />
          ) : (
            <CategoryProductCardSkeleton />
          )}
        </li>
      ))}
    </ul>
  );
}
