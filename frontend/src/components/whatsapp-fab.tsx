"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiWhatsapp } from "react-icons/si";

import { useActiveOrder } from "@/hooks/use-active-order";
import { FOOTER } from "@/lib/footer-constants";
import { cn } from "@/lib/utils";

const MINIMAL_CHROME_PATHS = ["/cart", "/checkout", "/orders/track"];

const waPrefill = encodeURIComponent(`Hi ${FOOTER.brand}, I have a question about my order.`);

export function WhatsAppFab() {
  const pathname = usePathname();
  const { activeOrder } = useActiveOrder();

  const hidden = MINIMAL_CHROME_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (hidden) return null;

  return (
    <Link
      href={`https://wa.me/${FOOTER.whatsappDigits}?text=${waPrefill}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={cn(
        "fixed right-0 z-50 flex flex-col items-center justify-center gap-2",
        "rounded-l-2xl bg-[#25D366] py-3.5 pl-2 pr-2.5 text-white",
        "shadow-[0_8px_24px_-6px_rgba(37,211,102,0.55),0_4px_12px_-4px_rgba(0,0,0,0.15)]",
        "ring-1 ring-white/25 transition hover:brightness-110 active:scale-[0.98]",
        "top-1/2 -translate-y-1/2",
        activeOrder && "max-md:top-[42%]"
      )}
    >
      <SiWhatsapp className="size-6 shrink-0 sm:size-7" aria-hidden />
      <span
        className="text-[11px] font-bold leading-none tracking-[0.12em] uppercase [writing-mode:vertical-rl]"
        aria-hidden
      >
        WhatsApp
      </span>
    </Link>
  );
}
