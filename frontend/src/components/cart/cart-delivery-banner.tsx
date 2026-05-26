import { Sparkles, Zap } from "lucide-react";

export function CartDeliveryBanner() {
  return (
    <div className="from-urja-forest/8 to-urja-forest/4 flex flex-col gap-2 rounded-2xl border border-[#4B7E37]/20 bg-linear-to-r px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-urja-forest flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="text-urja-gold size-4 shrink-0" aria-hidden />
        Yay! You get <span className="font-bold">FREE</span> delivery on this order
      </p>
      <p className="text-urja-forest/90 flex items-center gap-1.5 text-sm font-medium">
        <Zap className="size-4 fill-amber-400 text-amber-500" aria-hidden />
        Delivery in 10 mins
      </p>
    </div>
  );
}
