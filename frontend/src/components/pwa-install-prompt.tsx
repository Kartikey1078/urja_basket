"use client";

import { Share, Smartphone, X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { usePwaInstall } from "@/hooks/use-pwa-install";

/**
 * Branded install prompt for supported Android browsers and an iOS guide card.
 * Rendered only on storefront pages (not checkout). No server calls.
 */
export function PwaInstallPrompt() {
  const pathname = usePathname();
  const { visible, mode, install, dismiss } = usePwaInstall({ pathname });

  if (!visible || mode === "hidden") return null;

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
      className="border-urja-forest/15 fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 rounded-2xl border bg-white p-4 shadow-lg sm:inset-x-auto sm:right-4 sm:max-w-sm"
    >
      <button
        type="button"
        onClick={dismiss}
        className="text-muted-foreground absolute top-3 right-3 rounded-lg p-1 hover:bg-slate-100"
        aria-label="Dismiss install prompt"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <Image
          src="/brand/pwa-icon-192.png"
          alt=""
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-xl"
          aria-hidden
        />
        <div className="min-w-0">
          <p id="pwa-install-title" className="text-urja-forest text-sm font-bold">
            Install Urja Basket
          </p>
          <p id="pwa-install-desc" className="text-muted-foreground mt-1 text-xs leading-relaxed">
            {mode === "ios"
              ? "Add to your home screen for faster reorders and an app-like experience."
              : "Get quick access from your home screen — faster checkout and tracking."}
          </p>
        </div>
      </div>

      {mode === "ios" ? (
        <div className="bg-urja-forest/5 mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-slate-700">
          <Share className="text-urja-forest size-4 shrink-0" aria-hidden />
          <span>
            Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>
          </span>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => void install()}
            className="bg-urja-forest text-urja-cream inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold"
          >
            <Smartphone className="size-4" aria-hidden />
            Install
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700"
          >
            Not now
          </button>
        </div>
      )}

      {mode === "ios" ? (
        <button
          type="button"
          onClick={dismiss}
          className="mt-2 w-full text-center text-xs font-medium text-slate-500"
        >
          Not now
        </button>
      ) : null}
    </div>
  );
}
