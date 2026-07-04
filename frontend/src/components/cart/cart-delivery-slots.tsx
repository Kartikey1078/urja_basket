"use client";

import { cn } from "@/lib/utils";
import type { DeliverySlotId } from "@/lib/cart/types";

const SLOTS: { id: DeliverySlotId; title: string; subtitle?: string }[] = [
  { id: "express", title: "10 mins", subtitle: "Fastest" },
  { id: "today-evening", title: "Today", subtitle: "6–7 PM" },
  { id: "tomorrow-morning", title: "Tomorrow", subtitle: "Morning" },
];

type CartDeliverySlotsProps = {
  selected: DeliverySlotId;
  onSelect: (id: DeliverySlotId) => void;
};

export function CartDeliverySlots({ selected, onSelect }: CartDeliverySlotsProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium text-stone-900">Delivery time</h3>
      <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-3 sm:gap-2.5">
        {SLOTS.map((slot) => {
          const active = selected === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSelect(slot.id)}
              className={cn(
                "flex min-h-[3.75rem] flex-col items-center justify-center rounded-xl px-2 py-2.5 text-center transition sm:min-h-16",
                active
                  ? "bg-urja-forest text-white shadow-sm"
                  : "bg-stone-50 text-stone-800 ring-1 ring-stone-200/80 hover:bg-stone-100"
              )}
            >
              <span className="text-sm font-semibold">{slot.title}</span>
              {slot.subtitle ? (
                <span className={cn("mt-0.5 text-[11px]", active ? "text-white/75" : "text-stone-500")}>
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
