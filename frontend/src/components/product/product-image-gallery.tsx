"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type ProductImageGalleryProps = {
  images: string[];
  alt: string;
  badge?: ReactNode;
  className?: string;
  /** 0–1 dark overlay while content scrolls over the hero image */
  scrollOverlayOpacity?: number;
  outOfStock?: boolean;
};

export function ProductImageGallery({
  images,
  alt,
  badge,
  className,
  scrollOverlayOpacity = 0,
  outOfStock = false,
}: ProductImageGalleryProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = images.length > 0 ? images : ["/image.png"];

  const syncIndexFromScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const width = rail.clientWidth;
    if (width <= 0) return;
    const index = Math.round(rail.scrollLeft / width);
    setActiveIndex(Math.min(Math.max(index, 0), slides.length - 1));
  }, [slides.length]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    syncIndexFromScroll();
    rail.addEventListener("scroll", syncIndexFromScroll, { passive: true });
    return () => rail.removeEventListener("scroll", syncIndexFromScroll);
  }, [syncIndexFromScroll]);

  const scrollTo = (index: number) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollTo({ left: index * rail.clientWidth, behavior: "smooth" });
    setActiveIndex(index);
  };

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <div
        ref={railRef}
        className="scroll-x-rail relative flex snap-x snap-mandatory overflow-x-auto"
        aria-roledescription="carousel"
        aria-label={`${alt} photos`}
      >
        {slides.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="relative w-full shrink-0 snap-center snap-always"
          >
            <div className="relative aspect-[4/5] w-full bg-neutral-100 sm:aspect-square lg:aspect-[5/6] lg:max-h-[min(72vh,640px)] max-lg:min-h-[min(72vw,420px)]">
              <Image
                src={src}
                alt={slides.length > 1 ? `${alt} — photo ${index + 1}` : alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={index === 0}
                className={cn(
                  "object-cover object-center transition-[filter] duration-300",
                  outOfStock && "brightness-[0.72] saturate-[0.85]"
                )}
              />
              {/* Bottom white fade — blends image into content card (mobile) */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[46%] max-h-56 sm:h-[42%] sm:max-h-52 lg:hidden"
                aria-hidden
              >
                <div className="absolute inset-0 bg-gradient-to-t from-white from-[8%] via-white/95 via-[38%] to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_88%_at_50%_100%,#ffffff_0%,rgba(255,255,255,0.92)_32%,rgba(255,255,255,0.35)_58%,transparent_78%)]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {outOfStock ? (
        <div
          className="pointer-events-none absolute inset-0 z-[18] flex items-center justify-center"
          role="status"
          aria-label="Out of stock"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" aria-hidden />
          <span className="relative rounded-2xl border border-white/15 bg-black/50 px-6 py-3 text-sm font-bold tracking-[0.14em] text-white uppercase shadow-lg backdrop-blur-md ring-1 ring-white/10 sm:px-8 sm:py-3.5 sm:text-base">
            Out of Stock
          </span>
        </div>
      ) : null}

      {!outOfStock && scrollOverlayOpacity > 0.01 ? (
        <div
          className="pointer-events-none absolute inset-0 z-[15] bg-[#0b2b1e]"
          style={{ opacity: scrollOverlayOpacity }}
          aria-hidden
        />
      ) : null}

      {/* Desktop — soft bottom fade */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[16] hidden h-24 lg:block"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_100%_at_50%_100%,rgba(253,252,248,0.5)_0%,rgba(253,252,248,0.18)_42%,transparent_72%)]" />
        <div className="absolute inset-x-[12%] bottom-0 h-16 bg-gradient-to-t from-urja-cream/30 via-urja-cream/10 to-transparent" />
      </div>

      {badge ? <div className="absolute top-4 left-4 z-20 sm:top-5 sm:left-5">{badge}</div> : null}

      {slides.length > 1 ? (
        <>
          {/* Side fades — hint horizontal swipe */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white/50 to-transparent sm:w-10 lg:hidden"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white/50 to-transparent sm:w-10 lg:hidden"
            aria-hidden
          />
          <div
            className="absolute inset-x-0 bottom-5 z-20 flex justify-center gap-2"
            role="tablist"
            aria-label="Product photos"
          >
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Photo ${index + 1}`}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === activeIndex
                  ? "bg-urja-forest w-6 shadow-sm ring-2 ring-white/80"
                  : "bg-white/90 w-2 ring-1 ring-urja-forest/15 hover:bg-urja-gold/80"
              )}
            />
          ))}
          </div>
        </>
      ) : (
        <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center" aria-hidden>
          <span className="bg-urja-forest/90 h-1.5 w-8 rounded-full shadow-sm ring-2 ring-white/70" />
        </div>
      )}
    </div>
  );
}
