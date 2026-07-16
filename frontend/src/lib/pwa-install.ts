/** Storage key for 1-day dismiss cooldown (milliseconds since epoch). */
export const PWA_INSTALL_DISMISS_KEY = "urja-pwa-install-dismissed-until";

/** Paths where the install prompt must never appear (checkout flow). */
export const PWA_INSTALL_EXCLUDED_PREFIXES = ["/cart", "/checkout", "/orders/track"] as const;

export const PWA_ENGAGEMENT_DELAY_MS = 7_000;
export const PWA_ENGAGEMENT_SCROLL_PX = 200;
export const PWA_DISMISS_DURATION_MS = 24 * 60 * 60 * 1000;

export type PwaInstallMode = "android" | "ios" | "hidden";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    nav.standalone === true
  );
}

export function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome|Android/.test(ua);
  return isIos && isSafari;
}

export function isInstallPathExcluded(pathname: string): boolean {
  return PWA_INSTALL_EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isPwaInstallDismissed(): boolean {
  if (typeof localStorage === "undefined") return false;
  const raw = localStorage.getItem(PWA_INSTALL_DISMISS_KEY);
  if (!raw) return false;
  const until = Number(raw);
  return Number.isFinite(until) && Date.now() < until;
}

export function dismissPwaInstallForOneDay(): void {
  localStorage.setItem(
    PWA_INSTALL_DISMISS_KEY,
    String(Date.now() + PWA_DISMISS_DURATION_MS)
  );
}
