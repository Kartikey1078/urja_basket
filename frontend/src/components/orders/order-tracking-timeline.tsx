"use client";

import { motion } from "framer-motion";
import { Check, Circle, Package, ShoppingBag, Truck } from "lucide-react";

import type { OrderTrackingStep } from "@/lib/orders/types";
import { cn } from "@/lib/utils";

const ICONS = {
  order_placed: ShoppingBag,
  preparing: Package,
  out_for_delivery: Truck,
  delivered: Check,
  cancelled: Circle,
} as const;

export function OrderTrackingTimeline({ steps }: { steps: OrderTrackingStep[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const Icon = ICONS[step.id] ?? Circle;
        const isLast = index === steps.length - 1;
        return (
          <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast ? (
              <span
                className={cn(
                  "absolute left-[1.15rem] top-10 bottom-0 w-0.5",
                  step.state === "done" ? "bg-urja-forest" : "bg-black/10"
                )}
                aria-hidden
              />
            ) : null}
            <div
              className={cn(
                "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2",
                step.state === "done" && "border-urja-forest bg-urja-forest text-urja-cream",
                step.state === "active" &&
                  "border-urja-forest bg-white text-urja-forest shadow-md ring-4 ring-urja-forest/15",
                step.state === "pending" && "border-black/10 bg-white text-black/30"
              )}
            >
              {step.state === "active" ? (
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-urja-forest"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              ) : null}
              <Icon className="size-4" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className={cn(
                  "text-sm font-bold",
                  step.state === "pending" ? "text-black/40" : "text-urja-forest"
                )}
              >
                {step.title}
              </p>
              <p className="text-muted-foreground text-xs">{step.subtitle}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
