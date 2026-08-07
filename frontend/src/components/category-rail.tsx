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
      className="border-border/60 bg-background w-full min-w-0"
      aria-labelledby="category-rail-heading"
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-5 md:px-6 lg:px-6 xl:px-10">
        <div className="flex items-end justify-between gap-3 pt-5 sm:pt-6 md:pt-7">
          <h2
            id="category-rail-heading"
            className="text-base font-bold tracking-tight text-neutral-900 sm:text-lg md:text-xl"
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
            "grid w-full min-w-0 grid-cols-3 gap-x-3 gap-y-4 py-4",
            "sm:gap-x-4 sm:gap-y-5 sm:py-5",
            "md:gap-x-6 md:gap-y-6"
          )}
        >
          {SHOP_CATEGORIES.map(({ href, label, image }) => (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                className="group flex flex-col items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-urja-forest/30 focus-visible:ring-offset-2 touch-manipulation sm:gap-2.5"
              >
                <span className="relative mx-auto block aspect-square w-full max-w-[5.75rem] overflow-hidden rounded-[1.25rem] bg-[#ebf5f8] sm:max-w-[6.75rem] sm:rounded-[1.35rem] md:max-w-[7.75rem] lg:max-w-[8.75rem]">
                  <Image
                    src={image}
                    alt=""
                    width={280}
                    height={280}
                    sizes="(max-width: 640px) 28vw, (max-width: 1024px) 120px, 140px"
                    className="size-full object-cover object-center transition duration-200 group-active:scale-[0.98]"
                    draggable={false}
                  />
                </span>
                <span className="line-clamp-2 w-full px-0.5 text-center text-[13px] font-semibold leading-[1.25] text-neutral-800 sm:text-sm sm:leading-snug">
                  {label}
                </span>
                <span className="text-urja-forest text-[11px] font-semibold sm:text-xs">
                  Shop
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
