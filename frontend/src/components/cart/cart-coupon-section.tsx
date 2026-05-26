"use client";

import { ChevronDown, TicketPercent } from "lucide-react";
import { useState } from "react";

export function CartCouponSection() {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <span className="bg-urja-gold/25 text-urja-forest inline-flex size-9 items-center justify-center rounded-full">
            <TicketPercent className="size-4" strokeWidth={2} />
          </span>
          <span>
            <span className="text-urja-forest block text-sm font-bold">Apply Coupon</span>
            <span className="text-muted-foreground text-xs">
              Save more with exciting offers
            </span>
          </span>
        </span>
        <ChevronDown
          className={`text-muted-foreground size-5 shrink-0 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="border-border/60 border-t px-4 pb-4">
          <p className="text-muted-foreground py-3 text-sm">
            Coupon codes will be available at checkout. Use{" "}
            <span className="text-urja-forest font-semibold">URJA50</span> for demo savings.
          </p>
        </div>
      ) : null}
    </section>
  );
}
