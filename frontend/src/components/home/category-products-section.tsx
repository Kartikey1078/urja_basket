import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import {
  BestsellerProductCard,
  type BestsellerCardProduct,
} from "@/components/bestseller-product-card";
import { BestsellerProductCardSkeleton } from "@/components/bestseller-product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProducts } from "@/lib/api-products";
import type { CategoryProduct } from "@/lib/category-product-types";
import { categoryPath } from "@/lib/shop-categories";

type BadgeKind = "bestseller" | "discount";

type CategoryProductsSectionProps = {
  categorySlug: string;
  title: string;
  /** Max products in the horizontal rail / grid. */
  limit?: number;
};

function ShopCategoryLink({
  categorySlug,
  className,
}: {
  categorySlug: string;
  className?: string;
}) {
  return (
    <Link
      href={categoryPath(categorySlug)}
      className={
        className ??
        "text-urja-forest hover:text-urja-forest/85 inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold hover:underline sm:text-base"
      }
    >
      Shop
      <ChevronRight className="size-4 sm:size-[1.125rem]" strokeWidth={2} />
    </Link>
  );
}

function toCardProduct(p: CategoryProduct): BestsellerCardProduct {
  const badge: BadgeKind = p.mrp > p.price ? "discount" : "bestseller";
  const discountLabel =
    badge === "discount" && p.mrp > p.price
      ? `${Math.round((1 - p.price / p.mrp) * 100)}% OFF`
      : undefined;

  return {
    slug: p.slug,
    name: p.name,
    weight: p.weight,
    price: p.price,
    mrp: Math.max(p.mrp, p.price),
    image: p.image,
    badge,
    discountLabel,
    inStock: p.inStock !== false,
  };
}

function CategoryProductsSectionSkeleton({ title }: { title: string }) {
  return (
    <section
      className="bg-background mt-4 w-full min-w-0 sm:mt-5 md:mt-6"
      aria-busy="true"
      aria-label={`Loading ${title}`}
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl overflow-hidden px-3 sm:px-4 lg:px-6 xl:px-10">
        <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4">
          <Skeleton className="h-7 w-36 sm:h-8" />
          <Skeleton className="h-5 w-16" />
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

async function CategoryProductsSectionContent({
  categorySlug,
  title,
  limit = 5,
}: CategoryProductsSectionProps) {
  const raw = await fetchProducts({ categorySlug }).catch(() => []);
  const products = raw.slice(0, limit).map(toCardProduct);
  const headingId = `${categorySlug}-heading`;

  return (
    <section
      className="bg-background mt-4 w-full min-w-0 sm:mt-5 md:mt-6"
      aria-labelledby={headingId}
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl overflow-hidden px-3 sm:px-4 lg:px-6 xl:px-10">
        <div className="mb-3 flex items-end justify-between gap-2 sm:mb-4 sm:gap-3">
          <h2
            id={headingId}
            className="text-foreground min-w-0 text-lg font-bold leading-tight tracking-tight sm:text-xl md:text-2xl"
          >
            {title}
          </h2>
          <ShopCategoryLink categorySlug={categorySlug} />
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-neutral-50 px-4 py-8 text-center sm:py-10">
            <p className="text-muted-foreground text-sm">
              Browse our full {title.toLowerCase()} collection.
            </p>
            <ShopCategoryLink
              categorySlug={categorySlug}
              className="bg-urja-forest hover:bg-urja-forest/90 inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-white no-underline hover:no-underline sm:px-5 sm:py-2.5 sm:text-base"
            />
          </div>
        ) : (
          <div
            className="no-scrollbar scroll-x-rail flex w-full min-w-0 flex-nowrap snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-8 sm:gap-4 sm:pb-10 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0 md:snap-none lg:grid-cols-5 lg:gap-5 lg:pb-12"
            style={{
              scrollPaddingLeft: "max(0.75rem, env(safe-area-inset-left, 0px))",
              scrollPaddingRight: "max(0.75rem, env(safe-area-inset-right, 0px))",
            }}
          >
            {products.map((product) => (
              <BestsellerProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function CategoryProductsSection(props: CategoryProductsSectionProps) {
  return (
    <Suspense fallback={<CategoryProductsSectionSkeleton title={props.title} />}>
      <CategoryProductsSectionContent {...props} />
    </Suspense>
  );
}
