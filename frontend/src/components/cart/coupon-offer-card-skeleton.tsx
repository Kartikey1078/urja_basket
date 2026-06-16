import { Skeleton } from "@/components/ui/skeleton";

export function CouponOfferCardSkeleton() {
  return (
    <li className="rounded-xl border border-black/[0.06] bg-slate-50/80 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-full max-w-[200px]" />
        </div>
        <Skeleton className="h-7 w-14 shrink-0 rounded-lg" />
      </div>
    </li>
  );
}
