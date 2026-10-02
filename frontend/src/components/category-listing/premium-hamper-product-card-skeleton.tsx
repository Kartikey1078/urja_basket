import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PremiumHamperProductCardSkeletonProps = {
  className?: string;
  /** When true, reserve space for description + contents (loading state). */
  withDetails?: boolean;
};

export function PremiumHamperProductCardSkeleton({
  className,
  withDetails = false,
}: PremiumHamperProductCardSkeletonProps) {
  return (
    <article
      className={cn("mx-auto flex h-full w-full max-w-2xl min-w-0 flex-col pb-1", className)}
      aria-hidden
    >
      <div className="@container flex h-full flex-col overflow-hidden rounded-2xl border border-amber-200/50 bg-white ring-1 ring-amber-100/60">
        <div className="relative aspect-[15/14] w-full bg-[#f5f2ed] sm:aspect-[8/7]">
          <Skeleton className="absolute inset-3 rounded-xl sm:inset-4" />
          <Skeleton className="absolute top-2.5 left-2.5 h-5 w-20 rounded-full" />
          <Skeleton className="absolute top-2.5 right-2.5 size-8 rounded-full" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-3 pt-3 sm:px-4">
          <div className="shrink-0 space-y-1">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-2.5 w-14" />
          </div>
          {withDetails ? (
            <div className="mt-2 shrink-0 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2.5 w-24" />
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-8 rounded-lg sm:h-9" />
                ))}
              </div>
            </div>
          ) : null}
          <div className="min-h-3 flex-1" />
          <div className="shrink-0 border-t border-amber-100/90 pt-2.5">
            <div className="flex items-end justify-between gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-10 w-[4.5rem] rounded-full" />
            </div>
          </div>
          <div className="h-3 shrink-0 sm:h-4" />
        </div>
      </div>
    </article>
  );
}
