import { CartLineItemSkeleton } from "@/components/cart/cart-line-item-skeleton";
import { CouponOfferCardSkeleton } from "@/components/cart/coupon-offer-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function CartSkeleton() {
  return (
    <div className="space-y-4 px-4 py-4" aria-busy="true" aria-label="Loading cart">
      <Skeleton className="h-14 rounded-2xl" />
      {[1, 2, 3].map((i) => (
        <CartLineItemSkeleton key={i} />
      ))}
      <section className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="size-5 shrink-0 rounded" />
        </div>
        <ul className="mt-4 space-y-2">
          {[1, 2].map((i) => (
            <CouponOfferCardSkeleton key={i} />
          ))}
        </ul>
      </section>
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );
}
