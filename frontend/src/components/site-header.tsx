"use client";

import { cn } from "@/lib/utils";
import {
  Menu,
  ShoppingCart,
  Timer,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ClerkAuthControls } from "@/components/clerk-auth-controls";
import { useCart } from "@/hooks/use-cart";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/categories/fresh-fruits", label: "Fruits" },
  { href: "/categories/dry-fruits", label: "Dry Fruits" },
  { href: "/categories/nuts-seeds", label: "Nuts & Seeds" },
  { href: "/orders", label: "Track Order" },
] as const;

function DesktopDeliveryStrip() {
  return (
    <div className="mx-auto flex w-full max-w-md justify-center px-4 py-2 sm:max-w-lg sm:px-6 lg:max-w-xl">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[11px] leading-snug font-medium text-white/95 sm:gap-x-2.5 sm:text-xs md:text-sm">
        <Truck
          className="text-urja-gold size-3.5 shrink-0 sm:size-4"
          strokeWidth={1.5}
          aria-hidden
        />
        <span className="text-white/95">
          <span className="font-semibold text-white">Free delivery</span> on all orders
        </span>
        <span
          className="hidden h-3.5 w-px shrink-0 bg-white/35 sm:block"
          aria-hidden
        />
        <Timer
          className="text-urja-gold size-3.5 shrink-0 sm:size-4"
          strokeWidth={1.5}
          aria-hidden
        />
        <span className="font-normal text-white/90">Deliver in 30 mins</span>
      </div>
    </div>
  );
}

function LeafMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 56"
      fill="none"
      className={cn("h-9 w-8 shrink-0 lg:h-10 lg:w-9", className)}
      aria-hidden
    >
      <path
        fill="#757f62"
        d="M6 38c2-10 6-20 12-26-1 8-2 18-4 24-3 3-7 4-8 2z"
      />
      <path
        fill="#757f62"
        d="M24 6c1 0 2 2 3 6 2 10 3 22 3 32 0 6-1 10-3 12-2-2-3-6-3-12 0-10 1-22 3-32 1-4 2-6 3-6z"
      />
      <path
        fill="#757f62"
        d="M42 38c-2-10-6-20-12-26 1 8 2 18 4 24 3 3 7 4 8 2z"
      />
    </svg>
  );
}

function Wordmark({ compact }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 select-none">
      <LeafMark />
      <div className="leading-none">
        <span
          className={cn(
            "block font-semibold tracking-tight text-urja-forest",
            compact ? "text-xl" : "text-2xl lg:text-[1.65rem]"
          )}
          style={{ fontFamily: "var(--font-urja-serif), ui-serif, Georgia, serif" }}
        >
          URJA
        </span>
        <span
          className={cn(
            "mt-0.5 block font-medium tracking-[0.32em] text-urja-olive lg:text-urja-forest",
            compact ? "text-[9px]" : "text-[10px] lg:text-xs"
          )}
        >
          BASKET
        </span>
      </div>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { count: cartCount } = useCart();

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Announcement bar — desktop / tablet only: compact delivery promos */}
      <div className="bg-urja-forest text-white hidden md:block">
        <DesktopDeliveryStrip />
      </div>

      {/* Main bar — mobile */}
      <div className="border-b border-black/5 bg-urja-cream lg:border-b-0">
        <div className="mx-auto max-w-7xl px-3 pt-3 pb-2 lg:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-md text-neutral-900 hover:bg-black/5"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>

            <div className="shrink-0">
              <Wordmark compact />
            </div>

            <Link
              href="/cart"
              className="relative ml-auto inline-flex size-10 items-center justify-center text-neutral-900 hover:bg-black/5"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="size-6" strokeWidth={1.75} />
              <span className="bg-urja-forest absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>

        {/* Main bar — desktop */}
        <div className="mx-auto hidden max-w-7xl items-center justify-between gap-8 px-6 py-3.5 lg:flex lg:px-10">
          <Wordmark />

          <nav className="flex flex-1 items-center justify-center gap-7 text-sm font-medium text-urja-forest">
            {NAV_LINKS.map(({ href, label }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative pb-1 transition-opacity hover:opacity-90",
                    active &&
                      "after:bg-urja-gold after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:rounded-full"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-5 text-urja-forest">
            <ClerkAuthControls />
            <Link
              href="/cart"
              className="relative rounded-md p-2 hover:bg-black/5"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="size-5" strokeWidth={1.75} />
              <span className="bg-urja-forest absolute top-1 right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile flyout */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" id="mobile-nav">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            className="bg-urja-cream absolute top-0 left-0 flex h-full w-[min(88vw,320px)] flex-col gap-1 border-r border-black/10 p-4 pt-16 shadow-xl"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map(({ href, label }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-3 text-base font-medium text-urja-forest hover:bg-black/5",
                    active && "bg-urja-forest/10"
                  )}
                >
                  {label}
                </Link>
              );
            })}
            <div className="mt-4 border-t border-black/10 px-3 pt-4">
              <ClerkAuthControls className="flex-col items-stretch gap-2" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
