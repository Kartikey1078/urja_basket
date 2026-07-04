"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type CartHeaderProps = {
  itemCount: number;
};

export function CartHeader({ itemCount }: CartHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition hover:bg-stone-200/80"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight text-stone-900">Your cart</h1>
          <p className="text-xs text-stone-500 sm:text-sm">
            {itemCount} {itemCount === 1 ? "item" : "items"} · Review & checkout
          </p>
        </div>
      </div>
    </header>
  );
}
