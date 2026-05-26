"use client";

import { usePathname } from "next/navigation";

import { SiteBottomNav } from "@/components/site-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const MINIMAL_CHROME_PATHS = ["/cart", "/checkout", "/orders/track"];

export function ConditionalSiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const minimal = MINIMAL_CHROME_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (minimal) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <main className="max-md:pb-[calc(4.35rem+env(safe-area-inset-bottom))] flex-1">
        {children}
      </main>
      <div className="max-md:mb-[calc(4.35rem+env(safe-area-inset-bottom))]">
        <SiteFooter />
      </div>
      <SiteBottomNav />
    </>
  );
}
