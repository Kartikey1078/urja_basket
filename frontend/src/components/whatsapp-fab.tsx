"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiWhatsapp } from "react-icons/si";

import { useActiveOrder } from "@/hooks/use-active-order";
import { useCart } from "@/hooks/use-cart";
import { FOOTER } from "@/lib/footer-constants";
import { cn } from "@/lib/utils";

const MINIMAL_CHROME_PATHS = ["/cart", "/checkout", "/orders/track"];
const CART_PEEK_PATHS = ["/cart", "/checkout"];

const waPrefill = encodeURIComponent(`Hi ${FOOTER.brand}, I have a question about my order.`);

export function WhatsAppFab() {
  const pathname = usePathname();
  const { count, hydrated } = useCart();
  const { activeOrder } = useActiveOrder();

  const hidden = MINIMAL_CHROME_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (hidden) return null;

  const cartPeekVisible =
    hydrated &&
    count > 0 &&
    !CART_PEEK_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <Link
      href={`https://wa.me/${FOOTER.whatsappDigits}?text=${waPrefill}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={cn(
        "fixed right-3 z-50 flex size-14 shrink-0 items-center justify-center rounded-full",
        "bg-[#25D366] text-white",
        "shadow-[0_10px_28px_-8px_rgba(37,211,102,0.65),0_4px_12px_-4px_rgba(0,0,0,0.18)]",
        "ring-2 ring-white transition hover:brightness-110 active:scale-95",
        "md:right-5 md:size-[3.75rem]",
        cartPeekVisible
          ? "bottom-[calc(8.75rem+env(safe-area-inset-bottom))]"
          : "bottom-[calc(4.75rem+env(safe-area-inset-bottom))]",
        activeOrder ? "md:bottom-24" : "md:bottom-6"
      )}
    >
      <SiWhatsapp className="size-7 md:size-8" aria-hidden />
    </Link>
  );
}
