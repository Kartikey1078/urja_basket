import Image from "next/image";
import type { Metadata } from "next";

import { CategoryProductListing } from "@/components/category-listing";
import { fetchProducts } from "@/lib/api-products";
import { getCategoryHero } from "@/lib/category-hero";
import {
  SHOP_CATEGORIES,
  getShopCategoryBySlug,
  humanizeCategorySlug,
} from "@/lib/shop-categories";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SHOP_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = getShopCategoryBySlug(slug);
  const title = meta?.label ?? humanizeCategorySlug(slug);
  return {
    title: `${title} | Urja Basket`,
    description: `Shop ${title.toLowerCase()} at Urja Basket.`,
  };
}

export default async function CategoryBySlugPage({ params }: Props) {
  const { slug } = await params;
  const products = await fetchProducts({ categorySlug: slug }).catch(() => []);

  const meta = getShopCategoryBySlug(slug);
  const categoryLabel = meta?.label ?? humanizeCategorySlug(slug);
  const hero = getCategoryHero(slug);

  return (
    <div className="text-urja-forest">
      <h1 className="sr-only">{categoryLabel}</h1>
      <div className="relative w-full overflow-hidden bg-neutral-100">
        <Image
          src={hero.src}
          alt={hero.alt}
          width={hero.width}
          height={hero.height}
          className="h-auto w-full object-cover object-center"
          sizes="100vw"
          priority
        />
      </div>
      <CategoryProductListing
        categoryLabel={categoryLabel}
        categorySlug={slug}
        products={products}
      />
    </div>
  );
}
