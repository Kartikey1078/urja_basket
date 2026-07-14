import Image from "next/image";
import type { Metadata } from "next";

import { CategoryProductListing } from "@/components/category-listing";
import { JsonLd } from "@/components/seo/json-ld";
import { fetchProducts } from "@/lib/api-products";
import { getCategoryHero } from "@/lib/category-hero";
import {
  CATEGORY_SEO,
  breadcrumbJsonLd,
  createPageMetadata,
} from "@/lib/seo";
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
  const seo = CATEGORY_SEO[slug];

  return createPageMetadata({
    title,
    description: seo?.description ?? `Shop ${title.toLowerCase()} at Urja Basket with fast delivery in Delhi.`,
    path: `/categories/${slug}`,
    keywords: seo?.keywords,
    ogImage: getCategoryHero(slug).src,
  });
}

export default async function CategoryBySlugPage({ params }: Props) {
  const { slug } = await params;
  const products = await fetchProducts({ categorySlug: slug }).catch(() => []);

  const meta = getShopCategoryBySlug(slug);
  const categoryLabel = meta?.label ?? humanizeCategorySlug(slug);
  const hero = getCategoryHero(slug);

  return (
    <div className="text-urja-forest">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Categories", path: "/categories" },
          { name: categoryLabel, path: `/categories/${slug}` },
        ])}
      />
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
