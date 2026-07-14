"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ShoppingBag } from "lucide-react";
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

  const badge = count > 999 ? "999+" : count > 99 ? "99+" : String(count);

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
              "pointer-events-auto relative flex w-fit max-w-[min(100%,16.5rem)] items-center gap-2 rounded-full py-1.5 pr-1.5 pl-1.5",
              "bg-urja-forest text-urja-cream",
              "shadow-[0_10px_28px_-8px_rgba(11,43,30,0.48),0_3px_10px_-3px_rgba(0,0,0,0.14)]",
              "ring-1 ring-white/10 transition active:scale-[0.98]"
            )}
            aria-label={`View cart, ${count} item${count === 1 ? "" : "s"}, ${formatInr(bill.toPay)}`}
          >
            <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
              <ShoppingBag className="size-4 text-urja-cream/95" strokeWidth={2} />
              <span className="bg-urja-gold text-urja-forest absolute -top-0.5 -right-0.5 flex min-w-[1rem] items-center justify-center rounded-md px-0.5 py-px text-[9px] font-bold leading-none ring-2 ring-urja-forest">
                {badge}
              </span>
            </span>

            <span className="shrink-0">
              <span className="text-urja-cream/55 block text-[9px] font-medium leading-none">
                Total
              </span>
              <span className="mt-0.5 block min-w-[5rem] text-base leading-none font-bold tabular-nums tracking-tight">
                {formatInr(bill.toPay)}
              </span>
            </span>

            <span className="h-7 w-px shrink-0 bg-white/15" aria-hidden />

            <span className="shrink-0 text-center">
              <span className="text-urja-cream/55 block text-[9px] font-medium leading-none">
                {count === 1 ? "Item" : "Items"}
              </span>
              <span className="mt-0.5 block min-w-[2rem] text-base leading-none font-bold tabular-nums">
                {badge}
              </span>
            </span>

            <span className="bg-urja-gold inline-flex size-8 shrink-0 items-center justify-center rounded-full">
              <ChevronRight className="text-urja-forest size-4" strokeWidth={2.5} />
            </span>
          </Link>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
