"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const SLIDES = [
  {
    src: "/home/image_copy.png",
    alt: "Urja Basket — goodness in every bite. Premium fruits and dry fruits.",
  },
  {
    src: "/home/image_copy_2.png",
    alt: "Urja Basket — fresh premium fruits for a healthier you.",
  },
] as const;

const ROTATE_MS = 7000;

/**
 * Mobile-only hero: alternates two PNGs every 7s with a soft crossfade + dots.
 */
export function MobileHeroCarousel({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        "relative aspect-[1661/640] w-full overflow-hidden md:hidden",
        className
      )}
      aria-roledescription="carousel"
      aria-label="Featured banners"
    >
      <div className="absolute inset-0" aria-live="polite">
        {SLIDES.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="92vw"
            priority={i === 0}
            className={cn(
              "absolute inset-0 object-cover object-center transition-opacity duration-700 ease-out",
              i === index ? "z-10 opacity-100" : "z-0 opacity-0"
            )}
          />
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center gap-1.5"
        aria-hidden
      >
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={cn(
              "size-2 rounded-full shadow-sm transition-colors duration-300",
              i === index
                ? "bg-urja-forest ring-1 ring-white/50"
                : "bg-white/90 ring-1 ring-black/10"
            )}
          />
        ))}
      </div>
    </div>
  );
}
