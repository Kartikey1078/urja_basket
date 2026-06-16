import { Skeleton } from "@/components/ui/skeleton";

export function CartLineItemSkeleton() {
  return (
    <article className="rounded-2xl border border-black/[0.06] bg-white p-3 shadow-sm sm:p-4">
      <div className="flex gap-3">
        <Skeleton className="size-[72px] shrink-0 rounded-xl sm:size-20" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-5 w-16 rounded-md" />
          <div className="mt-1 flex items-end justify-between gap-2">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </article>
  );
}
