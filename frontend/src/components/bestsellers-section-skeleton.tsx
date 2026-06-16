import { BestsellerProductCardSkeleton } from "@/components/bestseller-product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function BestsellersSectionSkeleton() {
  return (
    <section
      className="bg-background mt-4 w-full min-w-0 sm:mt-5 md:mt-6"
      aria-busy="true"
      aria-label="Loading bestsellers"
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl px-3 pb-8 sm:px-4 sm:pb-10 lg:px-6 lg:pb-12 xl:px-10">
        <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4">
          <Skeleton className="h-7 w-36 sm:h-8" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex gap-3 overflow-hidden sm:gap-4 md:grid md:grid-cols-3 md:gap-4 lg:grid-cols-5 lg:gap-5">
          {Array.from({ length: 5 }, (_, i) => (
            <BestsellerProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
