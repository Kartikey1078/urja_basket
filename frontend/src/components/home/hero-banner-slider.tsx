"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    src: "/home/fruitbasket_compress.png",
    alt: "Fresh fruit gift basket",
  },
  {
    src: "/home/dryfruitbasket_compress.png",
    alt: "Premium dry fruit gift basket",
  },
] as const;

const INTERVAL_MS = 5000;

export function HeroBannerSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  const slide = SLIDES[index];

  return (
    <div
      className="relative h-full w-full min-h-0 max-h-full aspect-square md:min-h-[11.5rem] md:max-h-[min(92%,18rem)] lg:min-h-[13.5rem] lg:max-h-[min(94%,21rem)] xl:min-h-[15.5rem] xl:max-h-[min(95%,24rem)] 2xl:min-h-[17rem] 2xl:max-h-[26rem]"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slide.src}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, x: 24, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.98 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="(max-width: 768px) min(30vw, 9.5rem), (max-width: 1024px) min(44vw, 30rem), (max-width: 1536px) min(44vw, 34rem), 38rem"
            className="object-contain object-center drop-shadow-[0_12px_28px_rgba(11,43,30,0.18)]"
            priority={index === 0}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute -bottom-0.5 left-1/2 z-10 flex -translate-x-1/2 gap-1 md:bottom-1 lg:bottom-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            aria-label={`Show slide ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => setIndex(i)}
            className={`size-1.5 rounded-full transition sm:size-2 ${
              i === index ? "bg-urja-forest scale-110" : "bg-urja-forest/30 hover:bg-urja-forest/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
