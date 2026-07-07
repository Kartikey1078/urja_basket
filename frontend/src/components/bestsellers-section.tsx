import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { BestsellerProductCard } from "@/components/bestseller-product-card";
import { BestsellersSectionSkeleton } from "@/components/bestsellers-section-skeleton";
import { fetchBestsellerProducts, type ApiProduct } from "@/lib/api-products";

type BadgeKind = "bestseller" | "discount";

type BestsellerItem = {
  slug: string;
  name: string;
  weight: string;
  price: number;
  mrp: number;
  image: string;
  badge: BadgeKind;
  discountLabel?: string;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&w=400&h=400&fit=crop&q=80";

function toBestsellerItem(p: ApiProduct): BestsellerItem {
  const image = (p.image ?? p.mainImage ?? "").trim() || FALLBACK_IMAGE;
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
    image,
    badge,
    discountLabel,
  };
}

async function BestsellersSectionContent() {
  const raw = await fetchBestsellerProducts();
  const products = raw.map(toBestsellerItem);

  return (
    <section
      className="bg-background mt-4 w-full min-w-0 sm:mt-5 md:mt-6"
      aria-labelledby="bestsellers-heading"
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl overflow-hidden px-3 sm:px-4 lg:px-6 xl:px-10">
        <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4">
          <h2
            id="bestsellers-heading"
            className="text-foreground text-lg font-bold tracking-tight sm:text-xl md:text-2xl"
          >
            Bestsellers
          </h2>
          <Link
            href="/bestsellers"
            className="text-urja-forest hover:text-urja-forest/85 inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold hover:underline sm:text-base"
          >
            View All
            <ChevronRight className="size-4 sm:size-[1.125rem]" strokeWidth={2} />
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed bg-neutral-50 px-4 py-8 text-center text-sm">
            No bestsellers loaded. Ensure the API is running and products are flagged{" "}
            <code className="text-foreground rounded bg-white px-1 py-0.5 text-xs">is_best_seller</code>{" "}
            in the database.
          </p>
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

/**
 * Bestsellers: larger cards on mobile scroll; grid from md up.
 * Data from GET /api/v1/products?bestSeller=1
 */
export function BestsellersSection() {
  return (
    <Suspense fallback={<BestsellersSectionSkeleton />}>
      <BestsellersSectionContent />
    </Suspense>
  );
}
