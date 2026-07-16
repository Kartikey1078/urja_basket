import {
  Clock,
  Landmark,
  Mail,
  MapPin,
  Phone,
  ScanQrCode,
  Timer,
  Truck,
} from "lucide-react";
import Link from "next/link";
import {
  SiFacebook,
  SiInstagram,
  SiVisa,
  SiWhatsapp,
} from "react-icons/si";

import { BrandLogo } from "@/components/brand-logo";
import {
  FOOTER,
  FOOTER_HELP_LINKS,
  FOOTER_SHOP_LINKS,
} from "@/lib/footer-constants";

const waBase = `https://wa.me/${FOOTER.whatsappDigits}`;
const waPrefill = encodeURIComponent(
  `Hi ${FOOTER.brand}, I have a question about my order.`
);

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-urja-gold text-xs font-bold tracking-[0.2em] uppercase">
        {title}
      </h3>
      <ul className="mt-2.5 space-y-1.5 sm:mt-4 sm:space-y-2.5">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="text-urja-cream/78 hover:text-urja-cream text-sm font-medium transition hover:translate-x-0.5"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative mt-auto overflow-hidden border-t border-urja-forest/20 text-urja-cream"
      role="contentinfo"
    >
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,#061912_0%,#0b2b1e_42%,#0f3324_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[radial-gradient(circle_at_20%_0%,rgba(196,181,99,0.22),transparent_42%),radial-gradient(circle_at_85%_100%,rgba(154,139,92,0.12),transparent_40%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-urja-gold/45 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Promo strip */}
        <div className="border-b border-white/10 py-4 sm:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-urja-cream/90">
                <Truck className="text-urja-gold size-4 shrink-0" strokeWidth={1.75} />
                <span>
                  <span className="text-urja-gold font-bold">Free delivery</span> on all orders
                </span>
              </span>
              <span className="hidden h-4 w-px bg-white/15 sm:block" aria-hidden />
              <span className="inline-flex items-center gap-2 text-sm font-medium text-urja-cream/90">
                <Timer className="text-urja-gold size-4 shrink-0" strokeWidth={1.75} />
                Delivery in ~30 minutes
              </span>
            </div>
            <Link
              href={`${waBase}?text=${waPrefill}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#25D366] to-[#1ebe5d] px-5 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:brightness-110 sm:w-auto"
            >
              <SiWhatsapp className="size-[18px]" aria-hidden />
              Chat on WhatsApp
            </Link>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-6 py-6 sm:grid-cols-2 sm:gap-8 sm:py-10 lg:grid-cols-12 lg:gap-10 lg:py-12">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <BrandLogo size="lg" layout="horizontal" />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-urja-cream/75 sm:mt-4">
              {FOOTER.tagline}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-6">
              <Link
                href={FOOTER.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-urja-cream transition hover:border-urja-gold/40 hover:bg-white/10 hover:text-white"
                aria-label="Instagram"
              >
                <SiInstagram className="size-[18px]" aria-hidden />
              </Link>
              <Link
                href={FOOTER.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-urja-cream transition hover:border-urja-gold/40 hover:bg-white/10 hover:text-white"
                aria-label="Facebook"
              >
                <SiFacebook className="size-[18px]" aria-hidden />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 sm:contents lg:contents">
            <div className="lg:col-span-2">
              <FooterLinkColumn title="Shop" links={FOOTER_SHOP_LINKS} />
            </div>

            <div className="lg:col-span-2">
              <FooterLinkColumn title="Help" links={FOOTER_HELP_LINKS} />
            </div>
          </div>

          {/* Contact card */}
          <div className="lg:col-span-4">
            <h3 className="text-urja-gold text-xs font-bold tracking-[0.2em] uppercase">
              Visit & Contact
            </h3>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 shadow-inner backdrop-blur-sm sm:mt-4 sm:p-5">
              <div className="space-y-3 text-sm sm:space-y-4">
                <div className="flex gap-3">
                  <MapPin
                    className="text-urja-gold mt-0.5 size-4 shrink-0"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <div className="text-urja-cream/85 leading-relaxed">
                    {FOOTER.addressLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                    <Link
                      href={FOOTER.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-urja-gold mt-2 inline-block text-xs font-semibold underline-offset-2 hover:underline"
                    >
                      Open in Google Maps →
                    </Link>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Clock className="text-urja-gold mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden />
                  <p className="text-urja-cream/85">{FOOTER.storeHours}</p>
                </div>

                <div className="flex gap-3">
                  <Phone className="text-urja-gold mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden />
                  <a
                    href={`tel:+${FOOTER.whatsappDigits}`}
                    className="text-urja-cream/85 font-medium hover:text-urja-cream"
                  >
                    {FOOTER.phoneDisplay}
                  </a>
                </div>

                <div className="flex gap-3">
                  <Mail className="text-urja-gold mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden />
                  <a
                    href={`mailto:${FOOTER.email}`}
                    className="text-urja-cream/85 font-medium hover:text-urja-cream"
                  >
                    {FOOTER.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payments */}
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-3 py-4 sm:py-6"
          role="group"
          aria-label="Accepted payment methods"
        >
          <p className="text-[10px] font-bold tracking-[0.18em] text-urja-gold/80 uppercase">
            We accept
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.06] px-3 py-2 text-urja-cream/95">
              <SiVisa className="h-5 w-auto fill-current" aria-hidden />
              <span className="sr-only">Visa</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.06] px-3 py-2">
              <ScanQrCode className="text-urja-cream size-[18px]" strokeWidth={2} aria-hidden />
              <span className="text-xs font-semibold text-urja-cream/90">UPI</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.06] px-3 py-2">
              <Landmark className="text-urja-cream size-[18px]" strokeWidth={2} aria-hidden />
              <span className="text-xs font-semibold text-urja-cream/90">Net banking</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.06] px-3 py-2">
              <span className="text-xs font-semibold text-urja-cream/90">Cash on delivery</span>
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-2 border-t border-white/10 py-4 text-center sm:flex-row sm:gap-3 sm:py-5 sm:text-left">
          <p className="text-[11px] text-urja-cream/55">
            © {year} {FOOTER.brand}. All rights reserved.
          </p>
          <p className="text-[11px] text-urja-cream/45">
            Made with care in India · Freshness delivered daily
          </p>
        </div>
      </div>
    </footer>
  );
}
