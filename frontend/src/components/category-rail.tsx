import Image from "next/image";
import Link from "next/link";

import { SHOP_CATEGORIES } from "@/lib/shop-categories";
import { cn } from "@/lib/utils";

/**
 * Categories: centered row (3 shop categories).
 */
export function CategoryRail() {
  return (
    <section
      className="border-border/60 bg-background w-full min-w-0"
      aria-label="Shop by category"
    >
      <div
        className={cn(
          "mx-auto flex w-full min-w-0 max-w-7xl flex-wrap items-start justify-center gap-2 px-4 py-5",
          "sm:gap-2.5 sm:py-6 sm:px-5",
          "md:gap-6 md:py-7 md:px-6 lg:gap-7"
        )}
      >
        {SHOP_CATEGORIES.map(({ href, label, image }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "text-foreground group flex w-[5.25rem] min-w-[5.25rem] max-w-[5.25rem] shrink-0 grow-0 snap-start snap-always flex-col items-center gap-2 rounded-xl py-1.5 text-center outline-none ring-urja-forest/30 transition hover:opacity-90 focus-visible:ring-2 touch-manipulation",
              "sm:w-32 sm:min-w-[8rem] sm:max-w-[8rem] md:w-36 md:max-w-none md:min-w-0 md:gap-3"
            )}
          >
            <span className="relative block size-16 shrink-0 sm:size-20 md:size-24 lg:size-28">
              <span
                className="pointer-events-none absolute -bottom-1 left-1/2 z-0 h-3 w-[76%] -translate-x-1/2 rounded-[50%] bg-urja-forest/20 blur-[7px] transition-all duration-300 group-hover:-bottom-0.5 group-hover:h-3.5 group-hover:w-[82%] group-hover:bg-urja-forest/28 group-hover:blur-[9px]"
                aria-hidden
              />
              <span className="relative z-10 block size-full overflow-hidden rounded-[50%] bg-white shadow-[inset_0_0_0_2.5px_#fff,0_10px_22px_-8px_rgba(40,71,18,0.28),0_4px_10px_-4px_rgba(0,0,0,0.1)] ring-1 ring-neutral-200/90 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[inset_0_0_0_2.5px_#fff,0_16px_32px_-6px_rgba(40,71,18,0.34),0_8px_16px_-4px_rgba(0,0,0,0.12)] group-hover:ring-urja-forest/25">
                <Image
                  src={image}
                  alt=""
                  width={280}
                  height={280}
                  sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 112px"
                  className="size-full scale-[1.1] rounded-[50%] object-cover object-center transition duration-300 ease-out group-hover:scale-[1.16]"
                  draggable={false}
                />
              </span>
            </span>
            <span className="text-xs font-medium leading-snug tracking-tight whitespace-nowrap sm:text-sm md:text-[0.9375rem]">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
