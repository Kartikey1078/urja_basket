"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useActiveOrder } from "@/hooks/use-active-order";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

const PEEK_PATHS = ["/cart", "/checkout"];

export function ActiveOrderFab() {
  const pathname = usePathname();
  const { activeOrder } = useActiveOrder();
  const { count, hydrated } = useCart();

  const cartPeekVisible =
    hydrated &&
    count > 0 &&
    !PEEK_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <AnimatePresence>
      {activeOrder ? (
        <motion.div
          key="active-order-fab"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className={cn(
            "fixed z-50 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6",
            cartPeekVisible
              ? "bottom-[calc(8.75rem+env(safe-area-inset-bottom))]"
              : "bottom-[calc(4.85rem+env(safe-area-inset-bottom))]",
            "md:bottom-6"
          )}
        >
          <Link
            href={`/orders/track/${activeOrder.orderId}`}
            aria-label={`Track order ${activeOrder.orderNumber}`}
            className="block"
          >
            <motion.span
              className={cn(
                "relative flex min-w-[11.5rem] max-w-[min(92vw,18rem)] items-center gap-2.5 overflow-hidden",
                "rounded-full px-3 py-2.5 sm:min-w-[13rem] sm:px-4 sm:py-3",
                "border border-urja-gold/45 bg-urja-cream text-urja-forest",
                "ring-1 ring-white/60"
              )}
              animate={{
                boxShadow: [
                  "0 6px 20px rgba(196, 181, 99, 0.35), 0 2px 8px rgba(11, 43, 30, 0.12)",
                  "0 12px 36px rgba(196, 181, 99, 0.55), 0 0 0 6px rgba(196, 181, 99, 0.12)",
                  "0 6px 20px rgba(196, 181, 99, 0.35), 0 2px 8px rgba(11, 43, 30, 0.12)",
                ],
              }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileTap={{ scale: 0.97 }}
            >
              <span
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(196,181,99,0.18)_70%,transparent_92%)]"
                aria-hidden
              />
              <span className="bg-urja-gold/25 text-urja-forest relative flex size-9 shrink-0 items-center justify-center rounded-full ring-1 ring-urja-gold/50 sm:size-10">
                <span
                  className="bg-urja-gold/40 absolute inset-0 animate-ping rounded-full opacity-30"
                  aria-hidden
                />
                <Package className="relative size-4 sm:size-[1.125rem]" strokeWidth={2.25} />
              </span>
              <span className="relative min-w-0 flex-1 text-left">
                <span className="block text-[11px] font-bold tracking-wide uppercase sm:text-xs">
                  Track order
                </span>
                <span className="text-urja-forest/75 block truncate text-[10px] font-semibold sm:text-xs">
                  {activeOrder.statusLabel}
                </span>
              </span>
              <ChevronRight
                className="text-urja-gold relative size-4 shrink-0 sm:size-5"
                strokeWidth={2.5}
              />
            </motion.span>
          </Link>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
