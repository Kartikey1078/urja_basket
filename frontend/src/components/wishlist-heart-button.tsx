"use client";

import { Heart } from "lucide-react";
import { useCallback, useState } from "react";

import { useWishlist } from "@/hooks/use-wishlist";
import type { WishlistProductInput } from "@/lib/wishlist/types";
import { cn } from "@/lib/utils";

type WishlistHeartButtonProps = {
  product: WishlistProductInput;
  className?: string;
  iconClassName?: string;
};

export function WishlistHeartButton({
  product,
  className,
  iconClassName,
}: WishlistHeartButtonProps) {
  const { isWishlisted, toggle } = useWishlist();
  const [popping, setPopping] = useState(false);

  const saved = isWishlisted(product.slug);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      toggle(product);
      setPopping(true);
      window.setTimeout(() => setPopping(false), 380);
    },
    [product, toggle]
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={
        saved
          ? `Remove ${product.name} from wishlist`
          : `Save ${product.name} to wishlist`
      }
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm transition",
        "hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50",
        popping && "animate-[wishlist-pop_0.38s_ease-out]",
        className
      )}
    >
      <Heart
        className={cn(
          "transition-colors duration-200",
          saved ? "fill-red-500 text-red-500" : "fill-none text-neutral-700",
          iconClassName
        )}
        strokeWidth={saved ? 0 : 1.75}
      />
    </button>
  );
}
