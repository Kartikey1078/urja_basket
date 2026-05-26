import { Timer, Truck } from "lucide-react";

/**
 * Single-line, compact delivery promo strip (thin type + light border).
 */
export function DeliveryBanner() {
  return (
    <div
      className="text-[#2d4a22] no-scrollbar flex max-w-full flex-nowrap items-center justify-center gap-x-2 overflow-x-auto rounded-xl border border-[#2d4a22]/10 bg-[#f5f9f0] px-2.5 py-1.5 sm:gap-x-3 sm:rounded-2xl sm:px-3 sm:py-2"
      role="region"
      aria-label="Delivery information"
    >
      <Truck
        className="size-3 shrink-0 opacity-90 sm:size-3.5"
        strokeWidth={1.25}
        aria-hidden
      />
      <p className="text-[10px] font-normal leading-none tracking-tight whitespace-nowrap sm:text-xs">
        <span className="font-semibold">FREE</span>
        <span className="font-light"> Delivery on orders above ₹499</span>
      </p>
      <span
        className="h-3 w-px shrink-0 bg-[#2d4a22]/25 sm:h-3.5"
        aria-hidden
      />
      <Timer
        className="size-3 shrink-0 opacity-90 sm:size-3.5"
        strokeWidth={1.25}
        aria-hidden
      />
      <p className="text-[10px] font-light leading-none tracking-tight whitespace-nowrap sm:text-xs">
        Deliver in 10 mins
      </p>
    </div>
  );
}
