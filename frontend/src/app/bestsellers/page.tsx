import Image from "next/image";
import type { Metadata } from "next";

import { CategoryProductListing } from "@/components/category-listing";
import { fetchProducts } from "@/lib/api-products";
import { getBestsellersHero } from "@/lib/category-hero";

export const metadata: Metadata = {
  title: "Bestsellers | Urja Basket",
  description:
    "Shop customer favourites at Urja Basket — top-rated dry fruits, nuts, and more with fast delivery.",
};

export default async function BestsellersPage() {
  const products = await fetchProducts({ bestSellerOnly: true }).catch(() => []);
  const hero = getBestsellersHero();

  return (
    <div className="text-urja-forest">
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
