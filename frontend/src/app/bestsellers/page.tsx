import Image from "next/image";

import { CategoryProductListing } from "@/components/category-listing";
import { JsonLd } from "@/components/seo/json-ld";
import { fetchProducts } from "@/lib/api-products";
import { getBestsellersHero } from "@/lib/category-hero";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Bestsellers",
  description:
    "Shop customer favourites at Urja Basket — top-rated dry fruits, nuts, and more with free delivery in Delhi.",
  path: "/bestsellers",
  keywords: [
    "bestselling dry fruits",
    "popular nuts Delhi",
    "Urja Basket bestsellers",
    "top rated dry fruits online",
  ],
  ogImage: getBestsellersHero().src,
});

export default async function BestsellersPage() {
  const products = await fetchProducts({ bestSellerOnly: true }).catch(() => []);
  const hero = getBestsellersHero();

  return (
    <div className="text-urja-forest">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Bestsellers", path: "/bestsellers" },
        ])}
      />
      <h1 className="sr-only">Bestsellers</h1>
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
        categoryLabel="Bestsellers"
        bestSellerOnly
        products={products}
      />
    </div>
  );
}
