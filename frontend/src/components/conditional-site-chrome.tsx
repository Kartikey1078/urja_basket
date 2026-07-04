"use client";

import { usePathname } from "next/navigation";

import { CartPeekBar } from "@/components/cart/cart-peek-bar";
import { ActiveOrderFab } from "@/components/orders/active-order-fab";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

import { SiteBottomNav } from "@/components/site-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const MINIMAL_CHROME_PATHS = ["/cart", "/checkout", "/orders/track"];

function useCartPeekVisible() {
  const pathname = usePathname();
  const { count, hydrated } = useCart();
  if (!hydrated || count === 0) return false;
  return !MINIMAL_CHROME_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function ConditionalSiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const peekVisible = useCartPeekVisible();
  const minimal = MINIMAL_CHROME_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (minimal) {
    return (
      <>
        {children}
        <ActiveOrderFab />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main
        className={cn(
          "flex-1 max-md:pb-[calc(4.35rem+env(safe-area-inset-bottom))]",
          peekVisible && "max-md:pb-[calc(8.75rem+env(safe-area-inset-bottom))]"
        )}
      >
        {children}
      </main>
      <div className="max-md:mb-[calc(4.35rem+env(safe-area-inset-bottom))]">
        <SiteFooter />
      </div>
      <CartPeekBar />
      <ActiveOrderFab />
      <SiteBottomNav />
    </>
  );
}
