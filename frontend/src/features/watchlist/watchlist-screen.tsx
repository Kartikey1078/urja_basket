"use client";

import Image from "next/image";
import Link from "next/link";

import { WishlistHeartButton } from "@/components/wishlist-heart-button";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function WatchlistScreen() {
  const { items, hydrated, clear } = useWishlist();

  if (!hydrated) {
    return (
      <p className="text-muted-foreground mt-6 text-sm">Loading your wishlist…</p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-8">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Tap the heart on any product to save it here. Your list stays on this device.
        </p>
        <Link
          href="/categories"
          className="text-urja-forest border-urja-forest/30 mt-8 inline-flex rounded-full border bg-transparent px-5 py-2.5 text-sm font-semibold transition hover:bg-urja-forest/10"
        >
          Browse categories
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {items.length} saved {items.length === 1 ? "item" : "items"}
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-sm font-medium text-red-700 underline-offset-2 hover:underline"
        >
          Clear all
        </button>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((product) => (
          <li
            key={product.slug}
            className={cn(
              "border-border/80 bg-card overflow-hidden rounded-xl border shadow-md ring-1 ring-black/[0.04]"
            )}
          >
            <div className="bg-muted/40 relative aspect-square">
              <Link href={`/products/${product.slug}`} className="absolute inset-0 block">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
              </Link>
              <WishlistHeartButton
                product={product}
                className="absolute top-2 right-2 z-10 size-8"
                iconClassName="size-4"
              />
            </div>
            <div className="space-y-1 p-3">
              <Link
                href={`/products/${product.slug}`}
                className="text-foreground line-clamp-2 text-sm font-bold hover:underline"
              >
                {product.name}
              </Link>
              <p className="text-muted-foreground text-xs">{product.weight}</p>
              <p className="text-foreground text-base font-bold">{formatInr(product.price)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
