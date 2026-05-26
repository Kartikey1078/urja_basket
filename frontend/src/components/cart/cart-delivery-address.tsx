"use client";

import { Clock, MapPin } from "lucide-react";
import Link from "next/link";

import { useDeliveryAddress } from "@/hooks/use-delivery-address";
import { estimateDeliveryMinutes } from "@/lib/address/geocode";

export function CartDeliveryAddress() {
  const { selected, hydrated } = useDeliveryAddress();
  const eta = estimateDeliveryMinutes();

  if (!hydrated) {
    return (
      <section className="h-28 animate-pulse rounded-2xl border border-black/[0.06] bg-white" />
    );
  }

  if (!selected) {
    return (
      <section className="rounded-2xl border border-dashed border-urja-forest/30 bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          <span className="bg-urja-forest/10 text-urja-forest inline-flex size-10 shrink-0 items-center justify-center rounded-full">
            <MapPin className="size-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-urja-forest text-sm font-bold">Add delivery address</p>
            <p className="text-muted-foreground mt-0.5 text-sm leading-snug">
              Required before checkout. Use GPS or enter manually.
            </p>
            <Link
              href="/checkout"
              className="text-urja-forest mt-2 inline-block text-sm font-semibold underline-offset-2 hover:underline"
            >
              Select address
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="bg-urja-forest/10 text-urja-forest inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold">
          <Clock className="size-3" />
          Delivery in {eta} mins
        </span>
        <span className="text-muted-foreground text-[10px] font-semibold uppercase">
          {selected.addressType}
        </span>
      </div>
      <div className="flex gap-3">
        <span className="bg-urja-forest/10 text-urja-forest inline-flex size-10 shrink-0 items-center justify-center rounded-full">
          <MapPin className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-urja-forest text-sm font-bold">{selected.fullName}</p>
          <p className="text-muted-foreground mt-0.5 text-sm leading-snug">{selected.formatted}</p>
          <Link
            href="/checkout"
            className="text-urja-forest mt-2 inline-block text-sm font-semibold underline-offset-2 hover:underline"
          >
            Change address
          </Link>
        </div>
      </div>
    </section>
  );
}
