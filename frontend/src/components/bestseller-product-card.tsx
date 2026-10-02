"use client";

import {
  ProductGridCard,
  type ProductGridCardData,
} from "@/components/product/product-grid-card";

export type BestsellerCardProduct = ProductGridCardData & {
  badge: "bestseller" | "discount";
  discountLabel?: string;
};

export function BestsellerProductCard({
  product,
  layout = "grid",
}: {
  product: BestsellerCardProduct;
  layout?: "rail" | "grid";
}) {
  return (
    <ProductGridCard
      layout={layout}
      product={{
        slug: product.slug,
        name: product.name,
        weight: product.weight,
        price: product.price,
        mrp: product.mrp,
        image: product.image,
        inStock: product.inStock,
        isBestseller: product.badge === "bestseller",
      }}
    />
  );
}
