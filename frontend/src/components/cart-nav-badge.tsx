"use client";

import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

type CartNavBadgeProps = {
  className?: string;
};

export function CartNavBadge({ className }: CartNavBadgeProps) {
  const { count, hydrated } = useCart();

  if (!hydrated || count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      className={cn(
        "absolute -top-1.5 -right-2 flex min-w-[1.125rem] items-center justify-center rounded-full",
        "bg-urja-forest px-1 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm",
        className
      )}
      aria-hidden
    >
      {label}
    </span>
  );
}
