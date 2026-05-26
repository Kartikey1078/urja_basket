import { cn } from "@/lib/utils";
import Image from "next/image";

const IMG_W = 1672;
const IMG_H = 941;

/**
 * Wide brand banner — same insets, max width, and rounding as the main hero.
 */
export function HomePromoImage() {
  return (
    <section
      className={cn(
        "relative w-full min-w-0 overflow-x-clip",
        "px-3 sm:px-4 lg:mx-auto lg:max-w-7xl lg:px-6 xl:px-10"
      )}
      aria-label="Urja Basket — fresh fruits and premium dry fruits"
    >
      <div
        className={cn(
          "w-full min-w-0 overflow-hidden rounded-2xl shadow-sm"
        )}
      >
        <Image
          src="/home/image_promo.png"
          alt="Urja Basket: Fresh fruits and premium dry fruits delivered naturally. Highlights include natural sourcing, farm fresh quality, hygienic packing, and fast delivery."
          width={IMG_W}
          height={IMG_H}
          sizes="(max-width: 1024px) 92vw, min(1152px, calc(100vw - 5rem))"
          className="block h-auto w-full max-w-none object-contain object-center"
        />
      </div>
    </section>
  );
}
