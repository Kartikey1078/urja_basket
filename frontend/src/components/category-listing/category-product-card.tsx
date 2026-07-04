import { Star } from "lucide-react";
import Image from "next/image";

import type { CategoryProduct } from "@/lib/category-product-types";
import { cn } from "@/lib/utils";

import { QuantityButton } from "@/components/cart/quantity-button";
import { WishlistHeartButton } from "@/components/wishlist-heart-button";

import { BestsellerBadge } from "./bestseller-badge";

function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function discountPercent(price: number, mrp: number) {
  if (mrp <= 0 || mrp <= price) return 0;
  return Math.round((1 - price / mrp) * 100);
}

function ProductStarRating({ value }: { value: number }) {
  const filled = Math.min(5, Math.round(value));
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5 sm:size-4",
            i < filled
              ? "fill-amber-400 text-amber-400"
              : "fill-neutral-200 text-neutral-200"
          )}
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

type CategoryProductCardProps = {
  product: CategoryProduct;
  className?: string;
};

export function CategoryProductCard({ product, className }: CategoryProductCardProps) {
  const off = discountPercent(product.price, product.mrp);

  return (
    <article
      className={cn(
        "border-border/80 bg-card flex flex-col overflow-hidden rounded-xl border shadow-md ring-1 ring-black/[0.04]",
        className
      )}
    >
      <div className="bg-muted/40 relative aspect-square w-full shrink-0">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
        />
        {product.isBestseller ? (
          <div className="pointer-events-none absolute top-2 left-2 z-10 sm:top-3 sm:left-3">
            <BestsellerBadge />
          </div>
        ) : null}
        <WishlistHeartButton
          product={product}
          className="absolute top-2 right-2 z-20 size-8 sm:top-3 sm:right-3 sm:size-9"
          iconClassName="size-4"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3 sm:gap-2.5 sm:p-4">
        <h2 className="text-foreground line-clamp-2 text-sm font-bold leading-snug sm:text-base">
          {product.name}
        </h2>
        <div className="flex flex-wrap items-center gap-1.5">
          <ProductStarRating value={product.rating} />
          <span className="text-muted-foreground text-xs sm:text-sm">
            ({product.reviewCount.toLocaleString("en-IN")})
          </span>
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm">{product.weight}</p>
        {product.nutritionTags && product.nutritionTags.length > 0 ? (
          <ul className="flex flex-wrap gap-1" aria-label="Nutrition highlights">
            {product.nutritionTags.slice(0, 3).map((tag) => (
              <li
                key={tag}
                className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 ring-1 ring-emerald-200/80 sm:text-xs"
              >
                {tag}
              </li>
            ))}
            {product.nutritionTags.length > 3 ? (
              <li className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                +{product.nutritionTags.length - 3}
              </li>
            ) : null}
          </ul>
        ) : null}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-foreground text-base font-bold sm:text-lg">
            {formatInr(product.price)}
          </span>
          {product.mrp > product.price ? (
            <span className="text-muted-foreground text-sm line-through">
              {formatInr(product.mrp)}
            </span>
          ) : null}
          {off > 0 ? (
            <span className="text-[#4B7E37] text-sm font-semibold">{off}% OFF</span>
          ) : null}
        </div>
        <QuantityButton
          product={{
            slug: product.slug,
            name: product.name,
            weight: product.weight,
            price: product.price,
            mrp: product.mrp,
            image: product.image,
            tag: product.isBestseller ? "Bestseller" : undefined,
          }}
        />
      </div>
    </article>
  );
}
