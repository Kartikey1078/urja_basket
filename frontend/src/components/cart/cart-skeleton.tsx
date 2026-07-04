import { CartLineItemSkeleton } from "@/components/cart/cart-line-item-skeleton";
import { CouponOfferCardSkeleton } from "@/components/cart/coupon-offer-card-skeleton";
import { cartCardClass } from "@/components/cart/cart-shell";
import { Skeleton } from "@/components/ui/skeleton";

export function CartSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading cart">
      <section className={cartCardClass}>
        <div className="border-b border-stone-100 px-4 py-3">
          <Skeleton className="h-3 w-24" />
        </div>
        {[1, 2, 3].map((i) => (
          <CartLineItemSkeleton key={i} embedded />
        ))}
      </section>
      <Skeleton className="h-14 rounded-2xl" />
      <section className={cartCardClass}>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Skeleton className="size-9 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="size-5 shrink-0 rounded" />
        </div>
      </section>
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );
}
