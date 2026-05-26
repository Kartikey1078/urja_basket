"use client";

import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

type WishlistNavBadgeProps = {
  className?: string;
};

/** Small count pill for nav icons (bottom bar, header). Hidden until hydrated and count &gt; 0. */
export function WishlistNavBadge({ className }: WishlistNavBadgeProps) {
  const { count, hydrated } = useWishlist();

  if (!hydrated || count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      className={cn(
        "absolute -top-1.5 -right-2 flex min-w-[1.125rem] items-center justify-center rounded-full",
        "bg-red-500 px-1 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm",
        className
      )}
      aria-hidden
    >
      {label}
    </span>
  );
}
