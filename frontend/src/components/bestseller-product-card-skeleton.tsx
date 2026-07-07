import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type BestsellerProductCardSkeletonProps = {
  className?: string;
};

export function BestsellerProductCardSkeleton({
  className,
}: BestsellerProductCardSkeletonProps) {
  return (
    <article
      className={cn(
        "border-border/80 bg-card flex w-[10.5rem] min-w-[10.5rem] shrink-0 snap-start snap-always flex-col overflow-hidden rounded-xl border shadow-md ring-1 ring-black/[0.04] sm:w-[12rem] sm:min-w-[12rem] md:min-w-0 md:w-auto md:shrink",
        className
      )}
      aria-hidden
    >
      <Skeleton className="aspect-square w-full shrink-0 rounded-none" />
      <div className="flex flex-1 flex-col gap-1.5 p-2 sm:gap-2 sm:p-2.5 md:gap-2 md:p-3">
        <Skeleton className="h-3.5 w-full sm:h-4" />
        <Skeleton className="h-3.5 w-4/5 sm:h-4" />
        <Skeleton className="h-3 w-14" />
        <div className="flex gap-1.5">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3.5 w-10" />
        </div>
        <Skeleton className="mt-1 h-8 w-full rounded-lg sm:h-9" />
      </div>
    </article>
  );
}
