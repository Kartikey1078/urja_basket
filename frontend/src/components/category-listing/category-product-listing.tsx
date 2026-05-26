import type { CategoryProduct } from "@/lib/category-product-types";

import { CategoryProductListingClient } from "./category-product-listing-client";

type CategoryProductListingProps = {
  categoryLabel: string;
  categorySlug?: string;
  products: CategoryProduct[];
  bestSellerOnly?: boolean;
  className?: string;
};

export function CategoryProductListing({
  categoryLabel,
  categorySlug = "",
  products,
  bestSellerOnly = false,
  className,
}: CategoryProductListingProps) {
  return (
    <CategoryProductListingClient
      categoryLabel={categoryLabel}
      categorySlug={categorySlug}
      bestSellerOnly={bestSellerOnly}
      initialProducts={products}
      className={className}
    />
  );
}
