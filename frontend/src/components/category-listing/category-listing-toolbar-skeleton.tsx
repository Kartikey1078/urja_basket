import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type CategoryListingToolbarSkeletonProps = {
  className?: string;
};

export function CategoryListingToolbarSkeleton({
  className,
}: CategoryListingToolbarSkeletonProps) {
  return (
    <div
      className={cn("flex items-center justify-between gap-6 sm:gap-8", className)}
      aria-busy="true"
      aria-label="Loading filters"
    >
      <Skeleton className="h-8 w-[5.5rem] rounded-md" />
      <Skeleton className="h-8 w-[4.5rem] rounded-md" />
    </div>
  );
}
