"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCart } from "@/hooks/use-cart";
import { formatInr } from "@/lib/cart/pricing";
import { cn } from "@/lib/utils";

const HIDDEN_PATHS = ["/cart", "/checkout"];

export function CartPeekBar() {
  const pathname = usePathname();
  const { count, bill, hydrated } = useCart();

  const hidden =
    !hydrated ||
    count === 0 ||
    HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const badge = count > 99 ? "99+" : String(count);

  return (
    <AnimatePresence>
      {!hidden ? (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 480, damping: 34 }}
          className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-3 md:hidden"
          style={{
            bottom: "calc(4.35rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <Link
            href="/cart"
            className={cn(
              "pointer-events-auto relative flex w-[min(100%,20.5rem)] items-center rounded-full py-2 pr-2 pl-2",
              "bg-urja-forest text-urja-cream",
              "shadow-[0_12px_36px_-8px_rgba(11,43,30,0.52),0_4px_14px_-4px_rgba(0,0,0,0.16)]",
              "ring-1 ring-white/10 transition active:scale-[0.98]"
            )}
            aria-label={`View cart, ${count} item${count === 1 ? "" : "s"}, ${formatInr(bill.toPay)}`}
          >
            <span className="relative mr-2.5 flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10">
              <ShoppingBag className="size-5 text-urja-cream/95" strokeWidth={2} />
              <span className="bg-urja-gold text-urja-forest absolute -top-0.5 -right-0.5 flex min-w-[1.25rem] items-center justify-center rounded-md px-1 py-0.5 text-[10px] font-bold leading-none ring-2 ring-urja-forest">
                {badge}
              </span>
            </span>

            <span className="min-w-0 shrink-0">
              <span className="text-urja-cream/55 block text-[10px] font-medium leading-none">
                Total
              </span>
              <span className="mt-0.5 block text-lg leading-none font-bold tabular-nums tracking-tight">
                {formatInr(bill.toPay)}
              </span>
            </span>

            <span className="mx-2.5 h-9 w-px shrink-0 bg-white/15" aria-hidden />

            <span className="flex min-w-0 flex-1 items-center gap-1.5">
              <Package className="text-urja-gold size-4 shrink-0" strokeWidth={2} />
              <span className="text-urja-cream/70 truncate text-sm font-medium">
                {count} {count === 1 ? "item" : "items"}
              </span>
            </span>

            <span className="bg-urja-gold ml-1.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full">
              <ChevronRight className="text-urja-forest size-5" strokeWidth={2.5} />
            </span>
          </Link>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
