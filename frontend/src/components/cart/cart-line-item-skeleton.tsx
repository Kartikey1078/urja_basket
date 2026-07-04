import { Skeleton } from "@/components/ui/skeleton";

type CartLineItemSkeletonProps = {
  embedded?: boolean;
};

export function CartLineItemSkeleton({ embedded }: CartLineItemSkeletonProps) {
  return (
    <article className={embedded ? "border-b border-stone-100 px-4 py-4 last:border-0 sm:px-5" : "rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200/80 sm:p-5"}>
      <div className="flex gap-3">
        <Skeleton className="size-[4.25rem] shrink-0 rounded-xl sm:size-20" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-5 w-16 rounded-md" />
          <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-11 w-full rounded-xl sm:h-10 sm:w-28" />
          </div>
        </div>
      </div>
    </article>
  );
}
