import Image from "next/image";
import Link from "next/link";

import { SHOP_CATEGORIES } from "@/lib/shop-categories";

/**
 * Categories: horizontal scroll on small screens; centered row from md up when
 * it fits inside the max-width container.
 */
export function CategoryRail() {
  return (
    <section
      className="border-border/60 bg-background w-full min-w-0 "
      aria-label="Shop by category"
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl px-0 sm:px-2 lg:px-4 xl:px-6">
        <div
          className="no-scrollbar flex w-full min-w-0 touch-pan-x justify-start overflow-x-auto overscroll-x-contain scroll-smooth py-5 pl-4 pr-4 sm:py-6 sm:pl-5 sm:pr-5 md:justify-center md:py-7 lg:pl-6 lg:pr-6"
          style={{
            scrollPaddingLeft: "max(1rem, env(safe-area-inset-left, 0px))",
            scrollPaddingRight: "max(1rem, env(safe-area-inset-right, 0px))",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="flex w-max min-w-0 flex-nowrap items-start justify-start gap-1 sm:gap-2 md:gap-6 lg:gap-7">
            {SHOP_CATEGORIES.map(({ href, label, image }) => (
              <Link
                key={href}
                href={href}
                className="text-foreground group flex w-[5.5rem] shrink-0 flex-col items-center gap-2 rounded-xl py-1.5 text-center outline-none ring-urja-forest/30 transition hover:opacity-90 focus-visible:ring-2 sm:w-32 sm:gap-2.5 md:w-36 md:gap-3"
              >
                <span className="relative block size-16 shrink-0 overflow-hidden rounded-[50%] bg-white shadow-[inset_0_0_0_2.5px_#fff,0_2px_10px_rgba(0,0,0,0.08)] ring-1 ring-neutral-200/90 transition group-hover:ring-urja-forest/25 sm:size-20 md:size-24 lg:size-28">
                  <Image
                    src={image}
                    alt=""
                    width={280}
                    height={280}
                    sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 112px"
                    className="size-full scale-[1.1] rounded-[50%] object-cover object-center transition duration-300 ease-out group-hover:scale-[1.16]"
                  />
                </span>
                <span className="text-xs font-medium leading-snug tracking-tight whitespace-nowrap sm:text-sm md:text-[0.9375rem]">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
