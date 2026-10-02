"use client";

import Image from "next/image";
import Link from "next/link";

import { QuantityButton } from "@/components/cart/quantity-button";
import { WishlistHeartButton } from "@/components/wishlist-heart-button";
import { cn } from "@/lib/utils";

export type ProductGridCardData = {
  slug: string;
  name: string;
  weight: string;
  price: number;
  mrp: number;
  image: string;
  inStock?: boolean;
  isBestseller?: boolean;
};

type ProductGridCardProps = {
  product: ProductGridCardData;
  /** Horizontal home rails use fixed width; category grids use full cell width. */
  layout?: "rail" | "grid";
  className?: string;
};

function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function ProductGridCard({
  product,
  layout = "grid",
  className,
}: ProductGridCardProps) {
  const inStock = product.inStock !== false;
  const cartProduct = {
    slug: product.slug,
    name: product.name,
    weight: product.weight,
    price: product.price,
    mrp: product.mrp,
    image: product.image,
    tag: product.isBestseller ? "Bestseller" : undefined,
  };

  const variantLabel = product.weight?.trim() || "—";

  return (
    <article
      className={cn(
        "flex h-full min-w-0 flex-col",
        layout === "rail" &&
          "w-[7.25rem] min-w-[7.25rem] max-w-[7.25rem] shrink-0 snap-start snap-always sm:w-[7.75rem] sm:min-w-[7.75rem] sm:max-w-[7.75rem] md:max-w-none md:min-w-0 md:w-auto md:shrink",
        layout === "grid" && "w-full",
        "overflow-visible pr-1",
        className
      )}
    >
      <div
        className="relative overflow-visible rounded-xl border border-stone-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,20,0.04)]"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-[#f0eeea]">
          <Link
            href={`/products/${product.slug}`}
            className="absolute inset-0 block"
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes={
                layout === "rail"
                  ? "(max-width: 640px) 120px, 128px"
                  : "(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
              }
              className={cn(
                "object-cover object-center",
                !inStock && "opacity-50 grayscale-[0.4]"
              )}
            />
          </Link>

          {inStock ? (
            <WishlistHeartButton
              product={cartProduct}
              className="absolute top-1 right-1 z-20 size-7 rounded-full border border-stone-200/90 bg-white/95 shadow-sm backdrop-blur-[2px]"
              iconClassName="size-3.5"
            />
          ) : (
            <span className="absolute top-1 right-1 z-10 max-w-[calc(100%-0.5rem)] truncate rounded bg-neutral-800/88 px-1 py-0.5 text-[8px] font-bold text-white uppercase">
              Sold out
            </span>
          )}
        </div>

        <div
          className={cn(
            "relative z-20 -mt-6 flex min-h-12 items-center bg-white px-1.5 py-1",
            "sm:-mt-7 sm:min-h-[3.25rem] sm:px-2 sm:py-1.5"
          )}
        >
          <span
            className={cn(
              "min-w-0 flex-1 truncate pr-2 text-[10px] font-semibold text-stone-600 sm:pr-3 sm:text-[11px]",
              "max-md:pr-[3.75rem] md:pr-[5.25rem]"
            )}
          >
            {variantLabel}
          </span>
        </div>

        <div
          className={cn(
            "absolute z-30 right-0 bottom-1.5 translate-x-[10%] sm:bottom-2"
          )}
        >
          <QuantityButton
            chip
            chipDense
            inStock={inStock}
            product={cartProduct}
            className="mt-0 w-auto pt-0 md:hidden"
          />
          <QuantityButton
            chip
            chipProminent
            inStock={inStock}
            product={cartProduct}
            className="mt-0 hidden w-auto pt-0 md:block"
          />
        </div>
      </div>

      <div className="mt-1.5 flex min-w-0 flex-col gap-0.5 px-0.5 sm:mt-2">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0">
          <span className="text-[13px] font-extrabold leading-tight tracking-tight text-stone-900">
            {formatInr(product.price)}
          </span>
          {product.mrp > product.price ? (
            <span className="text-[10px] font-medium leading-tight text-stone-400 line-through sm:text-[11px]">
              {formatInr(product.mrp)}
            </span>
          ) : null}
        </div>

        <Link href={`/products/${product.slug}`} className="min-w-0">
          <h3 className="line-clamp-2 text-left text-[11px] font-semibold leading-snug text-stone-900 sm:text-xs">
            {product.name}
          </h3>
        </Link>
      </div>
    </article>
  );
}
