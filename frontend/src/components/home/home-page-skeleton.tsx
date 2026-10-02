import { BestsellersSectionSkeleton } from "@/components/bestsellers-section-skeleton";
import { CategoryProductsSectionSkeleton } from "@/components/home/category-products-section";
import { Skeleton } from "@/components/ui/skeleton";
import { SHOP_CATEGORIES } from "@/lib/shop-categories";

function HomeHeroSkeleton() {
  return (
    <section
      className="w-full min-w-0 px-3 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-3 md:px-6 md:pt-5 md:pb-4 lg:px-8 xl:px-10"
      aria-hidden
    >
      <Skeleton
        className="h-[clamp(15rem,48vw,17.5rem)] w-full rounded-2xl sm:h-[clamp(16rem,42vw,18.5rem)] sm:rounded-3xl md:h-auto md:min-h-[15rem] md:aspect-[2048/419] lg:min-h-[17rem] xl:min-h-[19rem] 2xl:min-h-[20rem]"
      />
    </section>
  );
}

function CategoryRailSkeleton() {
  return (
    <section
      className="border-border/60 bg-background w-full min-w-0 shadow-[0_14px_32px_-20px_rgba(11,43,30,0.18)]"
      aria-busy="true"
      aria-label="Loading categories"
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-5 md:px-6 lg:px-6 xl:px-10">
        <div className="flex items-end justify-between gap-3 pt-5 sm:pt-6 md:pt-7">
          <Skeleton className="h-7 w-44 sm:h-8 md:h-9" />
          <Skeleton className="h-5 w-16" />
        </div>
        <ul
          className="grid grid-cols-3 gap-x-2 gap-y-4 py-4 sm:gap-x-4 sm:gap-y-5 sm:py-5 md:gap-x-6 md:gap-y-6 md:py-6 lg:gap-x-8 lg:gap-y-7"
        >
          {SHOP_CATEGORIES.map(({ slug }) => (
            <li key={slug} className="flex flex-col items-center gap-2 sm:gap-2.5">
              <Skeleton
                className="aspect-square w-full max-w-[6.5rem] rounded-[1.25rem] sm:max-w-[8rem] md:max-w-[9.5rem] lg:max-w-[11rem] xl:max-w-[12rem]"
              />
              <Skeleton className="h-4 w-24 sm:h-5 sm:w-28" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FeaturesTrustBarSkeleton() {
  return (
    <section className="bg-background w-full min-w-0 sm:mt-4 md:mt-5" aria-hidden>
      <div className="mx-auto w-full min-w-0 max-w-7xl px-3 pb-6 sm:px-4 sm:pb-8 sm:pt-4 lg:px-6 lg:pb-10 lg:pt-5 xl:px-10">
        <Skeleton className="h-24 w-full rounded-2xl sm:h-28 sm:rounded-3xl md:h-32" />
      </div>
    </section>
  );
}

export function HomePageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading home page">
      <HomeHeroSkeleton />
      <CategoryRailSkeleton />
      <FeaturesTrustBarSkeleton />
      {SHOP_CATEGORIES.map(({ slug, label }) => (
        <CategoryProductsSectionSkeleton key={slug} title={label} />
      ))}
      <BestsellersSectionSkeleton />
    </div>
  );
}
