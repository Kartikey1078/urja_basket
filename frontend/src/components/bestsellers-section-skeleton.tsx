import { BestsellerProductCardSkeleton } from "@/components/bestseller-product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function BestsellersSectionSkeleton() {
  return (
    <section
      className="bg-background mt-4 w-full min-w-0 sm:mt-5 md:mt-6"
      aria-busy="true"
      aria-label="Loading bestsellers"
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl overflow-hidden px-3 sm:px-4 lg:px-6 xl:px-10">
        <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4">
          <Skeleton className="h-7 w-36 sm:h-8" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="no-scrollbar flex w-full min-w-0 flex-nowrap snap-x snap-mandatory gap-3 overflow-x-auto pb-8 sm:gap-4 sm:pb-10 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0 lg:grid-cols-5 lg:gap-5 lg:pb-12">
          {Array.from({ length: 5 }, (_, i) => (
            <BestsellerProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
