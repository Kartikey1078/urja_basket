import { Award, Leaf, ShieldCheck, Truck } from "lucide-react";

import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Leaf,
    title: "100% Natural",
    subtitle: "No Artificial Flavors",
  },
  {
    icon: ShieldCheck,
    title: "Premium Quality",
    subtitle: "Carefully Handpicked",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    subtitle: "At Your Doorstep",
  },
  {
    icon: Award,
    title: "Secure Packaging",
    subtitle: "Hygienic & Safe",
  },
] as const;

/**
 * Four-column trust strip — always one row (`grid-cols-4`), compact on mobile.
 */
export function FeaturesTrustBar() {
  return (
    <section
      className="bg-background  w-full min-w-0 sm:mt-4 md:mt-5"
      aria-label="Why shop with us"
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl px-3 pb-6  sm:px-4 sm:pb-8 sm:pt-4 lg:px-6 lg:pb-10 lg:pt-5 xl:px-10">
        <div className="border-[#2d4a22]/12 rounded-2xl border bg-[#f5f3e6] px-2 py-3 shadow-[0_6px_24px_-4px_rgba(45,74,34,0.12),0_2px_12px_-2px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.04] sm:rounded-3xl sm:px-5 sm:py-6 sm:shadow-[0_10px_32px_-6px_rgba(45,74,34,0.14),0_4px_16px_-4px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] md:px-8 md:py-8">
          <div className="text-[#2d4a22] grid min-w-0 grid-cols-4 gap-x-0">
            {FEATURES.map(({ icon: Icon, title, subtitle }, index) => (
              <div
                key={title}
                className={cn(
                  "flex min-w-0 flex-col items-center gap-0.5 px-0.5 text-center sm:gap-1 sm:px-1.5 md:gap-1.5 md:px-2",
                  index > 0 &&
                    "border-l border-[#2d4a22]/10 pl-1 sm:border-[#2d4a22]/12 sm:pl-2 md:pl-5 lg:pl-7"
                )}
              >
                <Icon
                  className="size-5 shrink-0 opacity-95 sm:size-7 md:size-8 lg:size-9"
                  strokeWidth={1.35}
                  aria-hidden
                />
                <h3 className="line-clamp-2 min-h-[2.25em] w-full text-[9px] font-bold leading-tight tracking-tight sm:min-h-0 sm:text-xs md:text-sm lg:text-base">
                  {title}
                </h3>
                <p className="text-[#2d4a22]/75 line-clamp-2 w-full text-[8px] font-normal leading-tight sm:text-[10px] md:text-xs">
                  {subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
