import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type CategoryProductCardSkeletonProps = {
  className?: string;
};

export function CategoryProductCardSkeleton({ className }: CategoryProductCardSkeletonProps) {
  return (
    <article
      className={cn(
        "border-border/80 bg-card flex flex-col overflow-hidden rounded-xl border shadow-md ring-1 ring-black/[0.04]",
        className
      )}
      aria-hidden
    >
      <Skeleton className="aspect-square w-full shrink-0 rounded-none" />
      <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-2.5 sm:p-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex gap-1.5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-10" />
        </div>
        <Skeleton className="h-3 w-16" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="mt-1 h-10 w-full rounded-lg" />
      </div>
    </article>
  );
}
