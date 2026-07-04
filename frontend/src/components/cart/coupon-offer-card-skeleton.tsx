import { Skeleton } from "@/components/ui/skeleton";

export function CouponOfferCardSkeleton() {
  return (
    <li className="overflow-hidden rounded-xl bg-white ring-1 ring-stone-200/80">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-full max-w-[220px]" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl sm:h-10 sm:w-24" />
      </div>
    </li>
  );
}
