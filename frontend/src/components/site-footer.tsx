import { Landmark, MapPin, ScanQrCode } from "lucide-react";
import Link from "next/link";
import {
  SiFacebook,
  SiInstagram,
  SiVisa,
  SiWhatsapp,
} from "react-icons/si";

import { FOOTER } from "@/lib/footer-constants";
import { cn } from "@/lib/utils";

const waBase = `https://wa.me/${FOOTER.whatsappDigits}`;
const waPrefill = encodeURIComponent(
  `Hi ${FOOTER.brand}, I have a question about my order.`
);

function addressShort() {
  const lines = FOOTER.addressLines;
  if (lines.length <= 2) return lines.join(" · ");
  return `${lines[0]} · ${lines[lines.length - 1]}`;
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  const iconLinkClass =
    "inline-flex size-10 items-center justify-center rounded-full border border-cyan-950/25 bg-gradient-to-b from-white/14 to-white/[0.06] text-white shadow-sm shadow-cyan-950/30 backdrop-blur-sm transition hover:border-teal-200/35 hover:from-white/22 hover:to-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-teal-200/45 focus-visible:outline-none sm:size-9 [&_svg]:size-[18px]";

  const payIconWrap =
    "inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.06] px-2.5 py-1.5 text-white/95 shadow-sm backdrop-blur-sm";

  return (
    <footer
      className={cn(
        "relative mt-auto overflow-hidden border-t border-teal-950/35 text-white"
      )}
      role="contentinfo"
    >
      {/* Petrol → jade → sea-glass: cool botanical, not “stock forest green” */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#040a0c_0%,#07161a_16%,#0c2629_34%,#123a3c_52%,#1d524d_70%,#2f6f62_88%,#4f8c7c_100%)]"
        aria-hidden
      />
      {/* Whisper of brand gold (diagonal) — ties footer to urja-gold without going loud */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,transparent_38%,rgba(196,181,99,0.07)_72%,transparent_92%)]"
        aria-hidden
      />
      {/* Cool vignette at top */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_50%_at_50%_-8%,rgba(0,12,18,0.45),transparent_55%)]"
        aria-hidden
      />
      {/* Soft sea-glass bloom at bottom */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(115%_72%_at_50%_118%,rgba(200,240,225,0.24),transparent_48%)]"
        aria-hidden
      />
      {/* Top hairline: icy mint */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/35 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-5 sm:py-7 lg:px-8 xl:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <p
              className="text-xl font-semibold tracking-tight sm:text-2xl"
              style={{
                fontFamily:
                  "var(--font-urja-serif), ui-serif, Georgia, serif",
              }}
            >
              {FOOTER.brand}
            </p>
            <p className="mt-0.5 max-w-md text-[11px] leading-snug text-pretty text-teal-50/88 sm:text-xs">
              {FOOTER.tagline}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-2.5">
            <Link
              href={FOOTER.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={iconLinkClass}
              aria-label="Instagram"
            >
              <SiInstagram aria-hidden />
            </Link>
            <Link
              href={FOOTER.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={iconLinkClass}
              aria-label="Facebook"
            >
              <SiFacebook aria-hidden />
            </Link>
            <Link
              href={`${waBase}?text=${waPrefill}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] to-[#1ebe5d] px-3.5 text-xs font-semibold text-white shadow-md shadow-black/25 transition hover:brightness-110 sm:h-9 sm:px-3 [&_svg]:size-[18px]"
            >
              <SiWhatsapp aria-hidden />
              WhatsApp
            </Link>
          </div>
        </div>

        <div
          className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-dashed border-teal-950/20 pt-4 sm:mt-5 sm:gap-x-4 sm:pt-5"
          role="group"
          aria-label="Accepted payment methods"
        >
          <p className="basis-full text-[10px] font-medium uppercase tracking-[0.18em] text-teal-100/65 sm:basis-auto sm:pr-1">
            We accept
          </p>
          <span className={payIconWrap} title="Visa">
            <SiVisa
              className="h-5 w-auto shrink-0 fill-current"
              aria-hidden
            />
            <span className="sr-only">Visa</span>
          </span>
          <span className={payIconWrap} title="UPI">
            <ScanQrCode
              className="size-[18px] shrink-0 text-teal-50"
              strokeWidth={2}
              aria-hidden
            />
            <span className="text-[11px] font-semibold tracking-wide text-teal-50">
              UPI
            </span>
          </span>
          <span className={payIconWrap} title="Net banking">
            <Landmark
              className="size-[18px] shrink-0 text-teal-50"
              strokeWidth={2}
              aria-hidden
            />
            <span className="text-[11px] font-semibold tracking-wide text-teal-50">
              Net banking
            </span>
          </span>
        </div>

        <div className="mt-4 border-t border-dashed border-teal-950/20 pt-4 sm:mt-5 sm:pt-5">
          <div className="flex max-w-lg gap-2.5 text-[11px] leading-snug text-teal-50/92 sm:text-xs">
            <MapPin
              className="mt-0.5 size-4 shrink-0 text-cyan-100/90"
              strokeWidth={2}
              aria-hidden
            />
            <div>
              <p>{addressShort()}</p>
              <Link
                href={FOOTER.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-[11px] font-medium text-teal-100 underline-offset-2 hover:text-white hover:underline"
              >
                Google Maps
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] text-teal-100/58 sm:mt-5 sm:text-left sm:text-[11px]">
          © {year} {FOOTER.brand}
        </p>
      </div>
    </footer>
  );
}
