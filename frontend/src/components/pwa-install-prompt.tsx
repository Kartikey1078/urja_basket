"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Share, ShieldCheck, Smartphone, Sparkles, X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { usePwaInstall } from "@/hooks/use-pwa-install";
import { cn } from "@/lib/utils";

const TRUST_POINTS = [
  { icon: ShieldCheck, label: "Secure" },
  { icon: Sparkles, label: "No app store" },
  { icon: Check, label: "Free" },
] as const;

/**
 * Branded install prompt for supported Android browsers and an iOS guide card.
 * Rendered only on storefront pages (not checkout). No server calls.
 */
export function PwaInstallPrompt() {
  const pathname = usePathname();
  const { visible, mode, install, dismiss } = usePwaInstall({ pathname });

  return (
    <AnimatePresence>
      {visible && mode !== "hidden" ? (
        <motion.div
          role="dialog"
          aria-labelledby="pwa-install-title"
          aria-describedby="pwa-install-desc"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 sm:inset-x-auto sm:right-4 sm:max-w-[22rem]"
        >
          <div
            className={cn(
              "overflow-hidden rounded-2xl",
              "bg-urja-cream ring-1 ring-urja-forest/12",
              "shadow-[0_18px_40px_-14px_rgba(11,43,30,0.28),0_6px_16px_-6px_rgba(0,0,0,0.12)]"
            )}
          >
            <div className="from-urja-gold via-urja-gold/90 to-urja-olive h-1 bg-gradient-to-r" aria-hidden />

            <div className="relative px-4 pt-4 pb-4">
              <button
                type="button"
                onClick={dismiss}
                className="text-urja-forest/45 hover:text-urja-forest/70 absolute top-3.5 right-3.5 flex size-8 items-center justify-center rounded-full transition hover:bg-urja-forest/6 active:scale-95"
                aria-label="Dismiss install prompt"
              >
                <X className="size-4" strokeWidth={2.25} />
              </button>

              <div className="flex items-start gap-3.5 pr-8">
                <div className="ring-urja-gold/35 relative shrink-0 rounded-2xl p-0.5 ring-1">
                  <Image
                    src="/brand/pwa-icon-192.png"
                    alt=""
                    width={56}
                    height={56}
                    className="size-14 rounded-[0.85rem]"
                    aria-hidden
                  />
                </div>

                <div className="min-w-0 pt-0.5">
                  <p
                    id="pwa-install-title"
                    className="text-urja-forest text-base leading-tight font-bold tracking-tight sm:text-[1.05rem]"
                    style={{ fontFamily: "var(--font-urja-serif), ui-serif, Georgia, serif" }}
                  >
                    Add Urja Basket to Home
                  </p>
                  <p
                    id="pwa-install-desc"
                    className="mt-1.5 text-sm leading-relaxed text-stone-600"
                  >
                    {mode === "ios"
                      ? "Open from your home screen for faster reorders and live order tracking."
                      : "One tap access — quicker checkout, easy tracking, no Play Store needed."}
                  </p>
                </div>
              </div>

              <ul className="mt-3.5 flex flex-wrap gap-2" aria-label="App install benefits">
                {TRUST_POINTS.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="bg-urja-forest/6 text-urja-forest inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase"
                  >
                    <Icon className="size-3 shrink-0" strokeWidth={2.25} aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>

              {mode === "ios" ? (
                <div className="mt-4 space-y-3">
                  <ol className="bg-urja-forest/5 space-y-2.5 rounded-xl px-3.5 py-3.5 text-sm text-stone-700 ring-1 ring-urja-forest/10">
                    <li className="flex items-start gap-3">
                      <span className="bg-urja-forest text-urja-cream flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        1
                      </span>
                      <span className="pt-0.5 leading-snug">
                        Tap <strong className="text-urja-forest">Share</strong>{" "}
                        <Share className="text-urja-forest inline size-3.5 align-[-2px]" aria-hidden />{" "}
                        at the bottom of Safari
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-urja-forest text-urja-cream flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        2
                      </span>
                      <span className="pt-0.5 leading-snug">
                        Choose <strong className="text-urja-forest">Add to Home Screen</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-urja-forest text-urja-cream flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        3
                      </span>
                      <span className="pt-0.5 leading-snug">
                        Tap <strong className="text-urja-forest">Add</strong> to finish
                      </span>
                    </li>
                  </ol>

                  <button
                    type="button"
                    onClick={dismiss}
                    className="text-urja-forest/55 hover:text-urja-forest/75 w-full py-1 text-center text-sm font-medium transition"
                  >
                    Maybe later
                  </button>
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => void install()}
                    className={cn(
                      "bg-urja-forest text-urja-cream inline-flex min-h-11 w-full items-center justify-center gap-2.5 rounded-xl px-4",
                      "text-sm font-semibold tracking-wide shadow-[0_8px_20px_-10px_rgba(11,43,30,0.65)]",
                      "ring-1 ring-white/10 transition active:scale-[0.98] hover:bg-urja-forest/92"
                    )}
                  >
                    <span className="bg-urja-gold/25 flex size-8 items-center justify-center rounded-full">
                      <Smartphone className="text-urja-cream size-4" strokeWidth={2.25} aria-hidden />
                    </span>
                    Install App
                  </button>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="text-urja-forest/55 hover:text-urja-forest/75 inline-flex min-h-10 w-full items-center justify-center rounded-xl text-sm font-medium transition active:scale-[0.98]"
                  >
                    Maybe later
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
