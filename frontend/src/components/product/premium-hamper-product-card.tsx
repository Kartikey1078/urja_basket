"use client";

import Image from "next/image";
import Link from "next/link";
import { Gift } from "lucide-react";

import { QuantityButton } from "@/components/cart/quantity-button";
import { WishlistHeartButton } from "@/components/wishlist-heart-button";
import {
  isFruitBasketCategory,
  isGiftHamperCategory,
} from "@/lib/fruit-basket";
import { cn } from "@/lib/utils";

export type PremiumHamperProductCardData = {
  slug: string;
  name: string;
  weight: string;
  price: number;
  mrp: number;
  image: string;
  inStock?: boolean;
  isBestseller?: boolean;
  basketFruits?: string[];
  shortDescription?: string;
  categorySlug?: string;
};

type PremiumHamperProductCardProps = {
  product: PremiumHamperProductCardData;
  className?: string;
};

function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

const MAX_INCLUDED_ITEMS = 15;

export function PremiumHamperProductCard({
  product,
  className,
}: PremiumHamperProductCardProps) {
  const inStock = product.inStock !== false;
  const categorySlug = product.categorySlug ?? "";
  const isBasket = isFruitBasketCategory(categorySlug);
  const isHamper = isGiftHamperCategory(categorySlug);
  const badgeLabel = isBasket ? "Fresh basket" : isHamper ? "Gift hamper" : "Curated";

  const cartProduct = {
    slug: product.slug,
    name: product.name,
    weight: product.weight,
    price: product.price,
    mrp: product.mrp,
    image: product.image,
    tag: product.isBestseller ? "Bestseller" : undefined,
  };

  const variantLabel = product.weight?.trim();
  const description = product.shortDescription?.trim();
  const includedItems = (product.basketFruits ?? [])
    .map((f) => f.trim())
    .filter(Boolean)
    .slice(0, MAX_INCLUDED_ITEMS);
  const hasContentsList = includedItems.length > 0;
  const hasDescription = Boolean(description);
  const showContentsSection = (isBasket || isHamper) && hasContentsList;

  return (
    <article
      className={cn(
        "mx-auto flex h-full w-full max-w-2xl min-w-0 flex-col pb-1 sm:pb-1.5",
        className
      )}
    >
      <div
        className={cn(
          "@container relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl",
          "border border-amber-200/70 bg-white",
          "shadow-[0_12px_40px_-24px_rgba(11,43,30,0.22)]",
          "ring-1 ring-amber-100/80"
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 bg-gradient-to-r from-amber-400/90 via-urja-gold to-emerald-400/80"
          aria-hidden
        />

        <div
          className={cn(
            "relative w-full shrink-0 overflow-hidden",
            isHamper ? "aspect-square" : "aspect-[15/14] sm:aspect-[8/7]"
          )}
        >
          <Link
            href={`/products/${product.slug}`}
            className={cn(
              "absolute inset-0 block",
              isHamper
                ? "bg-[#f5f2ed]"
                : "bg-gradient-to-b from-[#faf8f5] via-white to-[#f3efe8]"
            )}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) min(100vw, 42rem), 42rem"
              className={cn(
                "object-center",
                isHamper
                  ? "object-cover"
                  : "object-contain p-3 sm:p-4 md:p-5",
                !inStock && "opacity-55 grayscale-[0.35]"
              )}
            />
          </Link>

          <span
            className={cn(
              "absolute top-2.5 left-2.5 z-20 inline-flex items-center gap-1 rounded-full px-2 py-0.5",
              "bg-white/95 text-[9px] font-bold tracking-wide text-urja-forest uppercase shadow-sm ring-1 ring-amber-200/80 sm:text-[10px] sm:px-2.5 sm:py-1"
            )}
          >
            {isHamper ? (
              <Gift className="size-3 shrink-0 text-amber-700" strokeWidth={2.25} aria-hidden />
            ) : null}
            {badgeLabel}
          </span>

          {inStock ? (
            <WishlistHeartButton
              product={cartProduct}
              className="absolute top-2.5 right-2.5 z-20 size-8 rounded-full border border-stone-200/90 bg-white/95 shadow-sm backdrop-blur-[2px] sm:size-9"
              iconClassName="size-4"
            />
          ) : (
            <span className="absolute top-2.5 right-2.5 z-20 rounded-full bg-neutral-800/90 px-2 py-1 text-[9px] font-bold text-white uppercase">
              Sold out
            </span>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-3 pt-2.5 sm:px-4 sm:pt-3">
          <Link href={`/products/${product.slug}`} className="min-w-0 shrink-0">
            <h3 className="text-left text-xs font-bold leading-snug text-balance text-urja-forest sm:text-sm">
              {product.name}
            </h3>
            {variantLabel ? (
              <p className="mt-0.5 text-[10px] font-semibold text-stone-500 sm:text-[11px]">
                {variantLabel}
              </p>
            ) : null}
          </Link>

          {hasDescription ? (
            <p className="mt-2 text-[10px] leading-relaxed text-stone-600 sm:text-[11px]">
              {description}
            </p>
          ) : null}

          {showContentsSection ? (
            <div className="mt-2 min-w-0 shrink-0 sm:mt-2.5">
              <p className="text-[9px] font-bold tracking-wide text-stone-500 uppercase sm:text-[10px]">
                {isBasket ? "Fruits included" : "What's inside"}
              </p>
              <ul
                className="mt-1.5 grid auto-rows-min grid-cols-2 gap-x-2 gap-y-1.5 sm:gap-y-2"
                aria-label={isBasket ? "Fruits in this basket" : "Items in this hamper"}
              >
                {includedItems.map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="flex min-w-0 items-start gap-1.5 rounded-lg bg-amber-50/90 px-2 py-1.5 text-[10px] leading-snug font-medium text-urja-forest ring-1 ring-amber-100/90 sm:text-[11px] sm:py-2"
                  >
                    <span
                      className="mt-1.5 size-1 shrink-0 rounded-full bg-emerald-500/80"
                      aria-hidden
                    />
                    <span className="min-w-0 wrap-break-word">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="min-h-3 flex-1" aria-hidden />

          <div className="shrink-0 border-t border-amber-100/90 pt-2.5 sm:pt-3">
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                  <span className="text-base font-extrabold tracking-tight text-stone-900 sm:text-lg">
                    {formatInr(product.price)}
                  </span>
                  {product.mrp > product.price ? (
                    <span className="text-[11px] font-medium text-stone-400 line-through sm:text-xs">
                      {formatInr(product.mrp)}
                    </span>
                  ) : null}
                </div>
              </div>
              <QuantityButton
                chip
                chipProminent
                inStock={inStock}
                product={cartProduct}
                className="shrink-0"
              />
            </div>
          </div>

          <div className="h-3 shrink-0 sm:h-4" aria-hidden />
        </div>
      </div>
    </article>
  );
}
