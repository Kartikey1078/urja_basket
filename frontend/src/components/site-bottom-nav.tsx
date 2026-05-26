"use client";

import { Heart, Home, LayoutGrid, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SHOP_CATEGORIES } from "@/lib/shop-categories";
import { cn } from "@/lib/utils";

import { useWishlist } from "@/hooks/use-wishlist";

import { WishlistNavBadge } from "./wishlist-nav-badge";

/** Bottom bar icon + label tint */
const NAV_TINT = "#284712";

function categoriesActive(pathname: string) {
  if (pathname === "/categories") return true;
  return SHOP_CATEGORIES.some(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`)
  );
}

const ITEMS = [
  {
    href: "/",
    label: "Home",
    Icon: Home,
    active: (pathname: string) => pathname === "/",
  },
  {
    href: "/categories",
    label: "Categories",
    Icon: LayoutGrid,
    active: categoriesActive,
  },
  {
    href: "/login",
    label: "Login",
    Icon: LogIn,
    active: (pathname: string) =>
      pathname === "/login" ||
      pathname.startsWith("/login/") ||
      pathname.startsWith("/account"),
  },
  {
    href: "/watchlist",
    label: "Watchlist",
    Icon: Heart,
    active: (pathname: string) => pathname === "/watchlist",
  },
] as const;

export function SiteBottomNav() {
  const pathname = usePathname();
  const { count: wishlistCount, hydrated: wishlistHydrated } = useWishlist();

  return (
    <nav
      className="supports-[backdrop-filter]:bg-urja-cream/88 fixed right-0 bottom-0 left-0 z-30 border-t border-black/[0.08] bg-urja-cream/95 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] shadow-[0_-6px_28px_rgba(0,0,0,0.07)] backdrop-blur-md md:hidden"
      aria-label="Bottom navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5 px-1.5">
        {ITEMS.map(({ href, label, Icon, active }) => {
          const isActive = active(pathname);
          const isWatchlist = href === "/watchlist";
          const watchlistAria =
            isWatchlist && wishlistHydrated && wishlistCount > 0
              ? `Watchlist, ${wishlistCount} saved items`
              : label;

          return (
            <Link
              key={href}
              href={href}
              prefetch={href === "/" || href === "/categories"}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 transition-colors",
                isActive && "bg-[#284712]/12"
              )}
              style={{ color: NAV_TINT }}
              aria-label={watchlistAria}
            >
              <span className="relative inline-flex shrink-0">
                <Icon
                  className="size-[22px] shrink-0"
                  strokeWidth={2}
                  aria-hidden
                />
                {isWatchlist ? <WishlistNavBadge /> : null}
              </span>
              <span
                className={cn(
                  "text-[10px] leading-none font-medium tracking-tight sm:text-[11px]",
                  isActive && "font-semibold"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
