import Image from "next/image";
import Link from "next/link";

import { SHOP_CATEGORIES } from "@/lib/shop-categories";

export const metadata = {
  title: "Categories | Urja Basket",
  description: "Browse fruits, dry fruits, nuts, gift hampers, and more.",
};

export default function CategoriesPage() {
  return (
    <div className="bg-background min-w-0 px-4 py-8 sm:px-6 lg:mx-auto lg:max-w-7xl lg:px-10 lg:py-10">
      <h1
        className="text-urja-forest text-2xl font-bold tracking-tight sm:text-3xl"
        style={{ fontFamily: "var(--font-urja-serif), ui-serif, Georgia, serif" }}
      >
        Shop by category
      </h1>
      <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
        Pick a category to explore products.
      </p>
      <ul className="mx-auto mt-8 grid max-w-3xl grid-cols-3 gap-3 sm:gap-4">
        {SHOP_CATEGORIES.map(({ href, label, image }) => (
          <li key={href}>
            <Link
              href={href}
              className="border-border/80 group bg-card hover:border-urja-forest/25 flex flex-col items-center overflow-hidden rounded-2xl border px-3 pt-4 pb-3 shadow-sm transition hover:shadow-md sm:px-4 sm:pt-5 sm:pb-4"
            >
              <span className="relative aspect-square w-[min(100%,11rem)] overflow-hidden rounded-[50%] bg-white shadow-[inset_0_0_0_2.5px_#fff,0_2px_12px_rgba(0,0,0,0.07)] ring-1 ring-neutral-200/90 transition group-hover:ring-urja-forest/25 sm:w-[min(100%,12.5rem)]">
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 42vw, 200px"
                  className="scale-[1.1] rounded-[50%] object-cover object-center transition duration-300 group-hover:scale-[1.16]"
                />
              </span>
              <span className="text-urja-forest px-3 py-3 text-sm font-semibold sm:text-base">
                {label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
