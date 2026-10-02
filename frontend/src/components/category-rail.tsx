import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { SHOP_CATEGORIES } from "@/lib/shop-categories";
import { cn } from "@/lib/utils";

/**
 * Categories: Blinkit-style grid — pastel tile, square image, compact label.
 */
export function CategoryRail() {
  return (
    <section
      className="border-border/60 bg-background w-full min-w-0 shadow-[0_14px_32px_-20px_rgba(11,43,30,0.18)]"
      aria-labelledby="category-rail-heading"
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-5 md:px-6 lg:px-6 xl:px-10">
        <div className="flex items-end justify-between gap-3 pt-5 sm:pt-6 md:pt-7">
          <h2
            id="category-rail-heading"
            className="text-lg font-bold tracking-tight text-neutral-900 sm:text-xl md:text-2xl"
          >
            Shop by Category
          </h2>
          <Link
            href="/categories"
            className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 sm:text-sm"
          >
            View All
            <ChevronRight className="size-3.5 sm:size-4" strokeWidth={2} aria-hidden />
          </Link>
        </div>

        <ul
          className={cn(
            "grid w-full min-w-0 grid-cols-3 gap-x-2 gap-y-4 py-4",
            "sm:gap-x-4 sm:gap-y-5 sm:py-5",
            "md:gap-x-6 md:gap-y-6 md:py-6",
            "lg:gap-x-8 lg:gap-y-7"
          )}
        >
          {SHOP_CATEGORIES.map(({ href, label, image }) => (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                className="group flex flex-col items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-urja-forest/30 focus-visible:ring-offset-2 touch-manipulation sm:gap-2.5"
              >
                <span
                  className={cn(
                    "relative mx-auto w-full max-w-[6.5rem] pb-2 sm:max-w-[8rem]",
                    "md:max-w-[9.5rem] lg:max-w-[11rem] xl:max-w-[12rem]"
                  )}
                >
                  <span
                    className={cn(
                      "relative z-10 mx-auto block aspect-square w-full overflow-hidden rounded-[1.25rem] bg-[#ebf5f8]",
                      "shadow-[0_12px_28px_-8px_rgba(11,43,30,0.28)] ring-1 ring-black/[0.06]",
                      "sm:rounded-[1.35rem]",
                      "transition-shadow duration-200 group-hover:shadow-[0_16px_32px_-8px_rgba(11,43,30,0.34)]"
                    )}
                  >
                    <Image
                      src={image}
                      alt=""
                      width={280}
                      height={280}
                      sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 160px"
                      className="size-full object-cover object-center transition duration-200 group-active:scale-[0.98]"
                      draggable={false}
                    />
                    <span
                      className={cn(
                        "absolute right-2 bottom-2 z-20 flex size-7 items-center justify-center rounded-full",
                        "bg-white/95 text-urja-forest shadow-[0_4px_12px_-2px_rgba(11,43,30,0.25)] ring-1 ring-black/8",
                        "transition group-hover:bg-urja-forest group-hover:text-white sm:right-2.5 sm:bottom-2.5 sm:size-8"
                      )}
                      aria-hidden
                    >
                      <ChevronRight className="size-4 sm:size-[1.125rem]" strokeWidth={2.5} />
                    </span>
                  </span>
                  <span
                    className="pointer-events-none absolute bottom-0 left-1/2 z-0 h-3 w-[78%] -translate-x-1/2 rounded-[100%] bg-urja-forest/20 blur-md sm:h-3.5 sm:w-[82%]"
                    aria-hidden
                  />
                </span>
                <span className="line-clamp-2 w-full px-0.5 text-center text-sm font-semibold leading-snug text-neutral-800 sm:text-base md:text-[17px]">
                  {label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
