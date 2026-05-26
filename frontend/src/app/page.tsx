import { BestsellersSection } from "@/components/bestsellers-section";
import { CategoryRail } from "@/components/category-rail";
import { DeliveryBanner } from "@/components/delivery-banner";
import { FeaturesTrustBar } from "@/components/features-trust-bar";
import { HomeHero } from "@/components/home-hero";
import { HomePromoImage } from "@/components/home-promo-image";
import { VideoReviewsSection } from "@/components/video-reviews-section";

export default function Home() {
  return (
    <>
      <div className="mt-3 px-3 sm:mt-4 sm:px-4 lg:mx-auto lg:mt-4 lg:max-w-7xl lg:px-6 xl:px-10">
        <DeliveryBanner />
      </div>
      <div className="mt-2 sm:mt-3 lg:mt-5">
        <HomeHero />
      </div>
      <CategoryRail />
      <FeaturesTrustBar />
      <BestsellersSection />
      <div className="mt-4 sm:mt-5 md:mt-6">
        <HomePromoImage />
      </div>
      <VideoReviewsSection />
    </>
  );
}
