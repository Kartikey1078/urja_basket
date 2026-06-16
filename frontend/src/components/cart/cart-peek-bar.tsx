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

  return (
    <AnimatePresence>
      {!hidden ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="pointer-events-none fixed right-0 left-0 z-40 px-3 md:hidden"
          style={{
            bottom: "calc(4.35rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <Link
            href="/cart"
            className={cn(
              "pointer-events-auto relative mx-auto flex max-w-lg items-center gap-3 overflow-hidden rounded-2xl px-4 py-3",
              "border border-urja-gold/30 text-urja-cream",
              "bg-[linear-gradient(128deg,#3d5c3a_0%,#2d4a22_38%,#1a3d2a_68%,#0b2b1e_100%)]",
              "shadow-[0_10px_36px_rgba(11,43,30,0.32),inset_0_1px_0_rgba(253,252,248,0.12)]",
              "ring-1 ring-urja-olive/25 transition active:scale-[0.99]"
            )}
            aria-label={`View cart, ${count} item${count === 1 ? "" : "s"}, ${formatInr(bill.toPay)}`}
          >
            <span
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_42%,rgba(196,181,99,0.14)_78%,transparent_96%)]"
              aria-hidden
            />
            <span
              className="bg-urja-gold/20 text-urja-gold relative inline-flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-urja-gold/35"
            >
              <ShoppingBag className="size-5" strokeWidth={2} />
            </span>
            <span className="relative min-w-0 flex-1">
              <span className="block text-sm font-bold tracking-tight">
                {count} item{count === 1 ? "" : "s"} in cart
              </span>
              <span className="text-urja-cream/80 block text-xs">
                {formatInr(bill.toPay)} · Review & checkout
              </span>
            </span>
            <span className="bg-urja-cream/12 text-urja-cream relative inline-flex shrink-0 items-center gap-0.5 rounded-full border border-urja-cream/20 px-3 py-1.5 text-xs font-bold">
              View cart
              <ChevronRight className="size-3.5" strokeWidth={2.5} />
            </span>
          </Link>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
