"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { HeroBannerSlider } from "@/components/home/hero-banner-slider";

const heroAlt = "Urja Basket premium fruits and gifting";

const serifDisplay = {
  fontFamily: "var(--font-urja-serif), ui-serif, Georgia, serif",
} as const;

const easeOut = [0.22, 1, 0.36, 1] as const;

const bannerMotion = {
  initial: { opacity: 0, y: 16, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.65, ease: easeOut },
};

const textMotion = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: easeOut, delay: 0.12 },
};

const subtextMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: easeOut, delay: 0.22 },
};

const buttonMotion = {
  initial: { opacity: 0, y: 14, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.5, ease: easeOut, delay: 0.34 },
};

const sliderMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: easeOut, delay: 0.2 },
};

/** Full-bleed mobile bg — object-cover on the wide SVG washes out on short banners. */
const mobileHeroBackgroundStyle = {
  backgroundColor: "#E8F7FF",
  backgroundImage: [
    "radial-gradient(ellipse 130% 110% at -5% 25%, rgba(101,189,255,0.92) 0%, transparent 52%)",
    "radial-gradient(ellipse 95% 90% at 102% 65%, rgba(186,205,253,0.88) 0%, transparent 48%)",
    "radial-gradient(ellipse 80% 70% at 48% 40%, rgba(232,247,255,0.95) 0%, transparent 70%)",
    "linear-gradient(100deg, #87E3FD 0%, #98EEFF 20%, #E8F7FF 46%, #E8F7FF 56%, #E9E7F0 78%, #BACDFD 100%)",
  ].join(", "),
} as const;

export function HomeHero() {
  return (
    <section
      className="w-full min-w-0 px-3 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-3 md:px-6 md:pt-5 md:pb-4 lg:px-8 xl:px-10"
      aria-label="Welcome"
    >
      <motion.div
        className="relative h-[clamp(15rem,48vw,17.5rem)] w-full overflow-hidden rounded-2xl bg-[#E8F7FF] shadow-[0_8px_32px_-12px_rgba(72,120,180,0.28)] ring-1 ring-black/[0.06] sm:h-[clamp(16rem,42vw,18.5rem)] sm:rounded-3xl md:h-auto md:min-h-[15rem] md:aspect-[2048/419] lg:min-h-[17rem] xl:min-h-[19rem] 2xl:min-h-[20rem]"
        {...bannerMotion}
      >
        <div
          className="absolute inset-0 max-md:block md:hidden"
          style={mobileHeroBackgroundStyle}
          aria-hidden
        />

        <Image
          src="/home/hero-premium.svg"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 92vw, 1280px"
          className="hidden object-cover object-center md:block"
          priority
          unoptimized
          aria-hidden
        />

        <div
          className="relative z-10 flex h-full flex-row items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-5 sm:py-4 md:gap-6 md:px-8 md:py-5 lg:px-10 lg:gap-8 xl:px-12"
        >
          <div className="flex min-w-0 flex-[1_1_62%] flex-col items-start justify-center gap-2.5 pr-0.5 sm:gap-3 sm:pr-1 md:max-w-[48%] md:flex-1 md:gap-5 lg:max-w-[46%] lg:gap-6">
            <motion.div className="min-w-0 max-w-full md:max-w-none" {...textMotion}>
              <p
                className="text-[clamp(2.125rem,9.2vw,3.35rem)] font-bold leading-[1.08] tracking-tight text-urja-forest md:text-[clamp(2.35rem,4.5vw,4.5rem)] lg:text-[clamp(2.65rem,4vw,5rem)]"
                style={serifDisplay}
              >
                Farm-fresh goodness,
                <span className="mt-0.5 block text-[clamp(1.875rem,8.2vw,2.95rem)] font-semibold italic text-urja-forest/90 md:text-[clamp(2rem,4vw,3.85rem)] lg:text-[clamp(2.25rem,3.6vw,4.25rem)]">
                  packed with care.
                </span>
              </p>
              <motion.p
                className="mt-1.5 hidden text-[clamp(1.25rem,5.6vw,1.75rem)] font-medium leading-snug text-urja-forest/80 sm:mt-2 sm:block md:mt-3 md:text-[clamp(1.125rem,2.2vw,1.625rem)] lg:text-xl xl:text-2xl"
                {...subtextMotion}
              >
                At your door in no time.
              </motion.p>
            </motion.div>

            <motion.div {...buttonMotion}>
              <Link
                href="/categories"
                className="inline-flex items-center gap-1 rounded-full bg-urja-forest px-4 py-2.5 text-[clamp(0.8125rem,3.6vw,1rem)] font-bold tracking-wide text-white shadow-[0_4px_14px_rgba(11,43,30,0.2)] transition hover:bg-[#0f3526] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-urja-forest/40 focus-visible:ring-offset-2 sm:px-5 sm:py-2.5 sm:text-base md:px-7 md:py-3.5 md:text-xl lg:px-8 lg:py-4 lg:text-2xl"
              >
                Shop Now
                <ChevronRight className="size-4 shrink-0 sm:size-[1.125rem] md:size-6 lg:size-7" strokeWidth={2.5} aria-hidden />
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="flex h-full w-[clamp(6.75rem,30vw,9.5rem)] shrink-0 items-center justify-end sm:w-[clamp(7.25rem,32vw,10.25rem)] md:w-[44%] md:max-w-[30rem] lg:max-w-[34rem] xl:max-w-[38rem] 2xl:max-w-[42rem]"
            {...sliderMotion}
          >
            <HeroBannerSlider />
          </motion.div>
        </div>

        <span className="sr-only">{heroAlt}</span>
      </motion.div>
    </section>
  );
}
