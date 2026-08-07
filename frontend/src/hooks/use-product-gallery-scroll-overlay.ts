"use client";

import { type RefObject, useEffect, useState } from "react";

const MAX_OVERLAY = 0.42;

/** Peaks mid-scroll, fades out when hero is fully covered. Mobile sticky hero only. */
export function useProductGalleryScrollOverlay(
  sectionRef: RefObject<HTMLElement | null>,
  galleryRef: RefObject<HTMLElement | null>
): number {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    let raf = 0;

    const compute = () => {
      const section = sectionRef.current;
      const gallery = galleryRef.current;
      if (!section || !gallery) {
        setOpacity(0);
        return;
      }

      if (window.matchMedia("(min-width: 1024px)").matches) {
        setOpacity(0);
        return;
      }

      const galleryHeight = gallery.offsetHeight;
      if (galleryHeight <= 0) {
        setOpacity(0);
        return;
      }

      const scrolled = Math.max(0, -section.getBoundingClientRect().top);
      const t = Math.min(1, scrolled / (galleryHeight * 0.88));

      if (t <= 0 || t >= 1) {
        setOpacity(0);
        return;
      }

      setOpacity(4 * t * (1 - t) * MAX_OVERLAY);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sectionRef, galleryRef]);

  return opacity;
}
