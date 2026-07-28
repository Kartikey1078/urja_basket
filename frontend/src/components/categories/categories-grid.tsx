import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SHOP_CATEGORIES } from "@/lib/shop-categories";
import { cn } from "@/lib/utils";

const CARD_ACCENTS = [
  "from-emerald-950/55 via-emerald-900/20 to-transparent",
  "from-amber-950/50 via-amber-900/15 to-transparent",
  "from-lime-950/50 via-lime-900/15 to-transparent",
] as const;

export function CategoriesGrid() {
  return (
    <ul className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
      {SHOP_CATEGORIES.map(({ href, label, description, image }, index) => (
        <li key={href} className="min-w-0">
          <Link
            href={href}
            className={cn(
              "group bg-urja-cream relative flex h-full flex-col overflow-hidden rounded-[1.35rem]",
              "shadow-[0_14px_34px_-16px_rgba(11,43,30,0.28),0_4px_14px_-6px_rgba(0,0,0,0.08)]",
              "ring-1 ring-urja-forest/10 transition duration-300",
              "hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(11,43,30,0.34),0_8px_20px_-8px_rgba(0,0,0,0.1)]",
              "hover:ring-urja-forest/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-urja-forest/35"
            )}
          >
            <div className="relative aspect-[5/4] w-full overflow-hidden sm:aspect-[4/3]">
              <Image
                src={image}
                alt={`${label} — shop at Urja Basket`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-center transition duration-500 group-hover:scale-[1.06]"
              />
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t",
                  CARD_ACCENTS[index % CARD_ACCENTS.length]
                )}
                aria-hidden
              />
              <div className="from-urja-cream/90 absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t to-transparent" aria-hidden />

              <span className="bg-urja-cream/95 text-urja-forest absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ring-1 ring-white/60 backdrop-blur-sm sm:text-[11px]">
                Category
              </span>
            </div>

            <div className="flex flex-1 flex-col px-4 pt-4 pb-4 sm:px-5 sm:pt-5 sm:pb-5">
              <h2
                className="text-urja-forest text-lg font-bold tracking-tight sm:text-xl"
                style={{ fontFamily: "var(--font-urja-serif), ui-serif, Georgia, serif" }}
              >
                {label}
              </h2>
              <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm leading-relaxed">
                {description}
              </p>

              <span className="text-urja-forest mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                Shop now
                <span className="bg-urja-forest/8 group-hover:bg-urja-forest inline-flex size-7 items-center justify-center rounded-full transition group-hover:text-urja-cream">
                  <ArrowRight
                    className="size-3.5 transition group-hover:translate-x-0.5"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                </span>
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
