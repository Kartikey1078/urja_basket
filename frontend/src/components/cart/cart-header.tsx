"use client";

import { ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";

type CartHeaderProps = {
  itemCount: number;
};

export function CartHeader({ itemCount }: CartHeaderProps) {
  return (
    <header className="border-border/60 sticky top-0 z-30 border-b bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3.5 lg:max-w-2xl">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            className="text-urja-forest inline-flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" strokeWidth={2} />
          </Link>
          <h1 className="text-urja-forest truncate text-lg font-bold tracking-tight">
            My Cart ({itemCount} {itemCount === 1 ? "Item" : "Items"})
          </h1>
        </div>
        <button
          type="button"
          className="border-urja-forest/20 text-urja-forest inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-xs font-semibold shadow-sm transition hover:bg-urja-cream"
        >
          <Tag className="size-3.5" strokeWidth={2} />
          Offers
        </button>
      </div>
    </header>
  );
}
