import { BestsellersSection } from "@/components/bestsellers-section";
import { CategoryRail } from "@/components/category-rail";
import { FeaturesTrustBar } from "@/components/features-trust-bar";
import { HomeHero } from "@/components/home-hero";
import { CategoryProductsSection } from "@/components/home/category-products-section";
import { ShopLocationSection } from "@/components/home/shop-location-section";
import { JsonLd } from "@/components/seo/json-ld";
import {
  createPageMetadata,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Fresh Fruits & Dry Fruits Delivery in Delhi",
  description:
    "Urja Basket delivers fresh fruits, premium dry fruits, nuts & seeds in Delhi. Free delivery, hygienically packed, at your doorstep in ~30 minutes.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <h1 className="sr-only">
        Urja Basket — Fresh fruits, dry fruits & nuts delivered in Delhi
      </h1>
      <HomeHero />
      <CategoryRail />
      <FeaturesTrustBar />
      <CategoryProductsSection categorySlug="fresh-fruits" title="Fresh Fruits" />
      <CategoryProductsSection categorySlug="dry-fruits" title="Dry Fruits" />
      <CategoryProductsSection categorySlug="nuts-seeds" title="Nuts & Seeds" />
      <BestsellersSection />
      <ShopLocationSection />
    </>
  );
}
