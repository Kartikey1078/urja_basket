import type { CategoryProduct } from "@/lib/category-product-types";
import { cn } from "@/lib/utils";

import { ProductGridCard } from "@/components/product/product-grid-card";

type CategoryProductCardProps = {
  product: CategoryProduct;
  className?: string;
};

export function CategoryProductCard({ product, className }: CategoryProductCardProps) {
  return (
    <ProductGridCard
      layout="grid"
      className={cn(className)}
      product={{
        slug: product.slug,
        name: product.name,
        weight: product.weight,
        price: product.price,
        mrp: product.mrp,
        image: product.image,
        inStock: product.inStock,
        isBestseller: product.isBestseller,
      }}
    />
  );
}
