import { CategoryPageSkeleton } from "@/components/category-listing/category-page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function BestsellersLoading() {
  return (
    <div className="text-urja-forest">
      <div className="relative w-full overflow-hidden bg-neutral-100" aria-hidden>
        <Skeleton className="aspect-[21/7] w-full rounded-none sm:aspect-[21/6]" />
      </div>
      <CategoryPageSkeleton productCount={8} />
    </div>
  );
}
