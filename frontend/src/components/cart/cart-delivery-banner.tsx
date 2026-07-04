import { Truck } from "lucide-react";

export function CartDeliveryBanner() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#eef3ef] px-4 py-3.5 ring-1 ring-urja-forest/10 sm:px-5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-urja-forest">
        <Truck className="size-4" aria-hidden />
      </span>
      <p className="text-sm font-medium text-stone-800">
        Free delivery on this order
      </p>
    </div>
  );
}
