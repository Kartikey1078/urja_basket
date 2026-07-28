"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ShopLocationMap = dynamic(
  () => import("@/components/home/shop-location-map").then((mod) => mod.ShopLocationMap),
  {
    ssr: false,
    loading: () => <MapLoadingPlaceholder />,
  }
);

function MapLoadingPlaceholder() {
  return (
    <div className="bg-urja-forest/5 flex h-full min-h-[17.5rem] w-full items-center justify-center sm:min-h-[22rem] lg:min-h-[26rem]">
      <p className="text-urja-forest/60 text-sm font-medium">Loading map…</p>
    </div>
  );
}

/**
 * Defers MapLibre until the section is near the viewport — avoids scroll jumps on homepage refresh.
 */
export function ShopLocationMapSlot() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const node = hostRef.current;
    if (!node || shouldMount) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldMount(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldMount(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px 0px", threshold: 0.01 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldMount]);

  return (
    <div ref={hostRef} className="h-full w-full [overflow-anchor:none]">
      {shouldMount ? <ShopLocationMap /> : <MapLoadingPlaceholder />}
    </div>
  );
}
