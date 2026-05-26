"use client";

import { cn } from "@/lib/utils";
import type { DeliverySlotId } from "@/lib/cart/types";

const SLOTS: { id: DeliverySlotId; title: string; subtitle?: string }[] = [
  { id: "express", title: "10 mins", subtitle: "FASTEST" },
  { id: "today-evening", title: "Today", subtitle: "6 PM – 7 PM" },
  { id: "tomorrow-morning", title: "Tomorrow", subtitle: "Morning" },
];

type CartDeliverySlotsProps = {
  selected: DeliverySlotId;
  onSelect: (id: DeliverySlotId) => void;
};

export function CartDeliverySlots({ selected, onSelect }: CartDeliverySlotsProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-urja-forest text-base font-bold">Choose Delivery Slot</h2>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {SLOTS.map((slot) => {
          const active = selected === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSelect(slot.id)}
              className={cn(
                "flex min-h-[72px] flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-center transition",
                active
                  ? "border-urja-forest bg-urja-forest text-white shadow-md"
                  : "border-black/10 bg-white text-urja-forest hover:border-urja-forest/40"
              )}
            >
              <span className="text-sm font-bold leading-tight">{slot.title}</span>
              {slot.subtitle ? (
                <span
                  className={cn(
                    "mt-0.5 text-[10px] font-semibold uppercase tracking-wide sm:text-xs",
                    active ? "text-urja-gold" : "text-muted-foreground"
                  )}
                >
                  {slot.subtitle}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
