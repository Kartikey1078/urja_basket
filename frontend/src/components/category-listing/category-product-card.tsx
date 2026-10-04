import { PremiumHamperProductCard } from "@/components/product/premium-hamper-product-card";
import { ProductGridCard } from "@/components/product/product-grid-card";
import type { CategoryProduct } from "@/lib/category-product-types";
import { isHamperListingCategory } from "@/lib/fruit-basket";
import { cn } from "@/lib/utils";

type CategoryProductCardProps = {
  product: CategoryProduct;
  categorySlug: string;
  className?: string;
  homeGrid?: boolean;
};

export function CategoryProductCard({
  product,
  categorySlug,
  className,
  homeGrid = false,
}: CategoryProductCardProps) {
  if (isHamperListingCategory(categorySlug)) {
    return (
      <PremiumHamperProductCard
        homeGrid={homeGrid}
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
          basketFruits: product.basketFruits,
          shortDescription: product.shortDescription,
          categorySlug,
        }}
      />
    );
  }

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
