import { cn } from "@/lib/utils";
import Image from "next/image";

import { MobileHeroCarousel } from "@/components/mobile-hero-carousel";

const heroAlt =
  "Urja Basket — Nourish Naturally, Live Energetically. Premium fruits and dry fruits, farm fresh and hygienically packed.";

/**
 * Mobile: rotating hero (`home/image_copy.png` ↔ `home/image_copy_2.png` every 7s).
 * Desktop (`md+`): main Urja hero art. Shared inset + rounded frame.
 */
export function HomeHero() {
  return (
    <section
      className={cn(
        "relative w-full min-w-0 overflow-x-clip",
        "px-3 sm:px-4 lg:mx-auto lg:max-w-7xl lg:px-6 xl:px-10"
      )}
      aria-label="Urja Basket — nourish naturally"
    >
      <div className="w-full min-w-0 overflow-hidden rounded-2xl shadow-sm">
        <MobileHeroCarousel />

        <div className="relative hidden aspect-[1672/941] w-full md:block">
          <Image
            src="/home/UrjaBasket.png"
            alt={heroAlt}
            fill
            sizes="(max-width: 1024px) 92vw, min(1152px, calc(100vw - 5rem))"
            className="object-cover object-center"
            priority
          />
        </div>
      </div>
    </section>
  );
}
