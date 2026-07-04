"use client";

import Image from "next/image";

import { BestsellerBadge } from "@/components/category-listing/bestseller-badge";
import { QuantityButton } from "@/components/cart/quantity-button";
import { WishlistHeartButton } from "@/components/wishlist-heart-button";
import { cn } from "@/lib/utils";

export type BestsellerCardProduct = {
  slug: string;
  name: string;
  weight: string;
  price: number;
  mrp: number;
  image: string;
  badge: "bestseller" | "discount";
  discountLabel?: string;
};

function formatRupee(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function BestsellerProductCard({ product }: { product: BestsellerCardProduct }) {
  return (
    <article
      className={cn(
        "border-border/80 bg-card flex w-[10.5rem] min-w-[10.5rem] shrink-0 flex-col overflow-hidden rounded-xl border shadow-md ring-1 ring-black/[0.04] sm:w-[12rem] sm:min-w-[12rem] md:min-w-0 md:w-auto md:shrink"
      )}
    >
      <div className="bg-muted/40 relative aspect-square w-full shrink-0">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 168px, (max-width: 768px) 192px, 33vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute top-1.5 left-1.5 z-10 sm:top-2 sm:left-2">
          {product.badge === "bestseller" ? (
            <BestsellerBadge compact />
          ) : (
            <span className="bg-urja-forest inline-block rounded-md px-1.5 py-0.5 text-[8px] font-semibold text-white sm:text-[9px] md:text-[10px]">
              {product.discountLabel ?? "Sale"}
            </span>
          )}
        </div>
        <WishlistHeartButton
          product={{
            slug: product.slug,
            name: product.name,
            weight: product.weight,
            price: product.price,
            mrp: product.mrp,
            image: product.image,
            isBestseller: product.badge === "bestseller",
          }}
          className="absolute top-1.5 right-1.5 z-20 size-7 sm:top-2 sm:right-2 sm:size-8"
          iconClassName="size-3.5 sm:size-4"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 p-2 sm:gap-2 sm:p-2.5 md:gap-2 md:p-3">
        <h3 className="text-foreground line-clamp-2 min-h-[2.75rem] text-left text-[11px] font-bold leading-snug sm:min-h-[3rem] sm:text-xs md:min-h-0 md:text-sm lg:text-base">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-left text-[10px] sm:text-xs md:text-sm">
          {product.weight}
        </p>
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0 text-left">
          <span className="text-foreground text-xs font-bold sm:text-sm md:text-base">
            {formatRupee(product.price)}
          </span>
          <span className="text-muted-foreground text-[10px] line-through sm:text-xs md:text-sm">
            {formatRupee(product.mrp)}
          </span>
        </div>
        <QuantityButton
          compact
          product={{
            slug: product.slug,
            name: product.name,
            weight: product.weight,
            price: product.price,
            mrp: product.mrp,
            image: product.image,
          }}
        />
      </div>
    </article>
  );
}
