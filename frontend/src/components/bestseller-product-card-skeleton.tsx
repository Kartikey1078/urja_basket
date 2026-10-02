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
      className={cn("flex h-full min-w-0 w-full flex-col", className)}
      aria-hidden
    >
      <div className="relative overflow-visible rounded-xl border border-stone-200/90 bg-white pr-1">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-[#f0eeea]">
          <Skeleton className="absolute inset-0 rounded-none" />
          <Skeleton className="absolute top-1 right-1 size-7 rounded-full" />
        </div>
        <div className="flex min-h-8 items-center px-1.5 py-1.5 sm:min-h-9 sm:px-2 sm:py-2">
          <Skeleton className="h-2.5 w-10" />
        </div>
        <Skeleton className="absolute -right-1 bottom-[1.65rem] z-10 h-8 w-[3.5rem] translate-y-[58%] rounded-md sm:bottom-[1.85rem]" />
      </div>
      <div className="mt-1.5 flex flex-col gap-1 px-0.5 sm:mt-2">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </article>
  );
}
