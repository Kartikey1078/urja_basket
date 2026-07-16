"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  type BeforeInstallPromptEvent,
  type PwaInstallMode,
  PWA_ENGAGEMENT_DELAY_MS,
  PWA_ENGAGEMENT_SCROLL_PX,
  dismissPwaInstallForOneDay,
  isInstallPathExcluded,
  isIosSafari,
  isPwaInstallDismissed,
  isStandaloneDisplay,
} from "@/lib/pwa-install";

type UsePwaInstallOptions = {
  pathname: string;
};

/**
 * Captures `beforeinstallprompt` on Android Chrome and gates visibility behind
 * engagement (timer or scroll). iOS gets an Add-to-Home-Screen guide only.
 */
export function usePwaInstall({ pathname }: UsePwaInstallOptions) {
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const engagedRef = useRef(false);
  const [mode, setMode] = useState<PwaInstallMode>("hidden");
  const [visible, setVisible] = useState(false);

  const eligible =
    !isStandaloneDisplay() &&
    !isPwaInstallDismissed() &&
    !isInstallPathExcluded(pathname);

  useEffect(() => {
    if (!eligible) {
      setMode("hidden");
      setVisible(false);
      return;
    }

    if (isIosSafari()) {
      setMode("ios");
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      deferredRef.current = event as BeforeInstallPromptEvent;
      setMode("android");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, [eligible, pathname]);

  useEffect(() => {
    if (!eligible || mode === "hidden") return;

    engagedRef.current = false;
    setVisible(false);

    const reveal = () => {
      if (engagedRef.current) return;
      engagedRef.current = true;
      setVisible(true);
    };

    const timer = window.setTimeout(reveal, PWA_ENGAGEMENT_DELAY_MS);

    const onScroll = () => {
      if (window.scrollY >= PWA_ENGAGEMENT_SCROLL_PX) reveal();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [eligible, mode, pathname]);

  const install = useCallback(async () => {
    const event = deferredRef.current;
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    deferredRef.current = null;
    setVisible(false);
  }, []);

  const dismiss = useCallback(() => {
    dismissPwaInstallForOneDay();
    setVisible(false);
  }, []);

  return { visible, mode, install, dismiss };
}
