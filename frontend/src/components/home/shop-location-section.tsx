import { MapPin } from "lucide-react";

import { ShopLocationMapSlot } from "@/components/home/shop-location-map-slot";
import { SHOP_LOCATION } from "@/lib/shop-location";

/**
 * Premium 3D store locator for the homepage — MapLibre + OpenFreeMap.
 */
export function ShopLocationSection() {
  return (
    <section
      className="bg-background mt-4 w-full min-w-0 pb-8 [overflow-anchor:none] sm:mt-5 sm:pb-10 md:mt-6 md:pb-12 lg:pb-16 xl:pb-[4.5rem]"
      aria-labelledby="shop-location-heading"
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-10">
        <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4">
          <div>
            <p className="text-urja-forest/60 text-xs font-semibold uppercase tracking-[0.14em]">
              Visit us
            </p>
            <h2
              id="shop-location-heading"
              className="text-urja-forest mt-1 text-xl font-bold tracking-tight sm:text-2xl"
              style={{ fontFamily: "var(--font-urja-serif), ui-serif, Georgia, serif" }}
            >
              Find {SHOP_LOCATION.name}
            </h2>
          </div>
          <span className="text-urja-forest/70 hidden shrink-0 items-center gap-1.5 rounded-full bg-[#eef3ef] px-3 py-1.5 text-xs font-semibold ring-1 ring-urja-forest/10 sm:inline-flex">
            <MapPin className="size-3.5" aria-hidden />
            Delhi 110092
          </span>
        </div>

        <div className="overflow-hidden rounded-[1.35rem] shadow-[0_18px_40px_-16px_rgba(11,43,30,0.28),0_8px_20px_-10px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06] sm:rounded-[1.65rem]">
          <div className="relative h-[17.5rem] w-full sm:h-[22rem] lg:h-[26rem]">
            <ShopLocationMapSlot />
          </div>
        </div>
      </div>
    </section>
  );
}
