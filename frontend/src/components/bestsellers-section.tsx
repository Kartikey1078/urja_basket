import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { BestsellerProductCard } from "@/components/bestseller-product-card";
import { BestsellersSectionSkeleton } from "@/components/bestsellers-section-skeleton";
import { fetchBestsellerProducts, type ApiProduct } from "@/lib/api-products";
import { PRODUCT_LISTING_GRID_CLASS } from "@/lib/product-grid-layout";

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
  inStock: boolean;
};

const HOME_BESTSELLERS_LIMIT = 10;

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
    inStock: p.inStock !== false,
  };
}

async function BestsellersSectionContent() {
  const raw = await fetchBestsellerProducts(HOME_BESTSELLERS_LIMIT);
  const products = raw.map(toBestsellerItem);

  return (
    <section
      className="bg-background mt-4 w-full min-w-0 pb-12 sm:mt-5 sm:pb-14 md:mt-6 md:pb-16 lg:pb-20"
      aria-labelledby="bestsellers-heading"
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-10">
        <div className="mb-3 flex items-end justify-between gap-2 sm:mb-4 sm:gap-3">
          <h2
            id="bestsellers-heading"
            className="text-foreground min-w-0 text-lg font-bold leading-tight tracking-tight sm:text-xl md:text-2xl"
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
          <div className={PRODUCT_LISTING_GRID_CLASS}>
            {products.map((product) => (
              <BestsellerProductCard key={product.slug} product={product} layout="grid" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Data from GET /api/v1/products?bestSeller=1&limit=10 */
export function BestsellersSection() {
  return (
    <Suspense fallback={<BestsellersSectionSkeleton />}>
      <BestsellersSectionContent />
    </Suspense>
  );
}
