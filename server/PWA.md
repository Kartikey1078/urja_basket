# Custom PWA Install Popup — Urja Basket

## Brief: how it will work

1. User opens the **storefront** (Next.js frontend) on mobile.
2. On **Android Chrome**, the browser fires a one-time `beforeinstallprompt` event when the site meets PWA criteria (HTTPS, valid manifest, engagement).
3. We **intercept** that event, save it, and show our own branded bottom sheet / banner: *“Install Urja Basket for faster ordering”* with **Install** and **Not now**.
4. User taps **Install** → we call `prompt()` → native browser install dialog → home-screen icon added.
5. User taps **Not now** → dismiss; store preference in `localStorage` (e.g. hide for 7 days).
6. On **iPhone Safari**, there is **no** `beforeinstallprompt`. We show a small guide instead: *Share → Add to Home Screen* with a screenshot-style hint.

**Still the same website** — no Play Store app, no extra backend. Install is 100% client-side.

> **Note:** Manifest lives in `frontend/src/app/manifest.ts`, not server. All install UI code belongs in **frontend**.

---

## PWA best practices — does this follow them?

| Practice | Our approach |
|----------|----------------|
| Don’t block content | ✅ Banner at bottom; dismissible |
| Don’t spam | ✅ Show once per session / respect `localStorage` cooldown |
| Don’t fake native install on iOS | ✅ iOS gets instructions only, not a fake Install button |
| Valid manifest + HTTPS | ✅ Already have `manifest.ts` |
| Icons 192×192 & 512×512 PNG | ⚠️ Currently SVG only — add PNGs for better install support |
| Optional service worker | Not required for install prompt; add later for offline |

**Verdict:** Custom prompt is a **common, acceptable** pattern on Android if dismissible and not aggressive. Apple does not allow programmatic install — instructions only.

---

## Limitations (Android vs iOS)

| Platform | Custom install popup | What actually happens |
|----------|----------------------|------------------------|
| **Android Chrome** | ✅ Works via `beforeinstallprompt` | Native install dialog after our button |
| **Android Firefox / Samsung** | ⚠️ May vary | Some browsers ignore event; fallback = menu hint |
| **iPhone Safari** | ❌ No programmatic install | Show “Add to Home Screen” guide only |
| **Desktop Chrome** | ✅ Sometimes shows event | Optional; can hide on desktop |
| **Already installed** | ❌ Event won’t fire | Detect `display-mode: standalone` → hide prompt |
| **In-app browsers** (Instagram, WhatsApp) | ❌ Usually no install | Detect and skip or show “Open in Chrome” |

---

## Extra API calls, performance, re-renders?

| Concern | Impact |
|---------|--------|
| **API calls** | **Zero** — no server calls |
| **Bundle size** | Small (~2–4 KB) — one client component + hook |
| **Re-renders** | Minimal — one `useState` for visibility; event listener registered once in `useEffect` |
| **Performance** | Negligible — no polling, no layout shift if bottom sheet is fixed |
| **SEO** | Unaffected — client-only UI |

No changes to Express API, EC2, or admin.

---

## Prerequisites (quick wins before popup)

1. Add **PNG icons** `192×192` and `512×512` to `frontend/public/brand/` and reference in `manifest.ts` (Android install criteria).
2. Confirm production URL is **HTTPS** (Vercel ✅).
3. Keep `display: "standalone"` in manifest.

---

## Short implementation plan (frontend only)

### Step 1 — Hook: `use-pwa-install.ts`
- Listen for `beforeinstallprompt` → `preventDefault()` → store event in ref.
- Detect iOS Safari → set `showIosGuide`.
- Detect already installed (`matchMedia('(display-mode: standalone)')`) → never show.
- Respect `localStorage`: `pwa-install-dismissed-until` timestamp.

### Step 2 — Component: `pwa-install-prompt.tsx`
- **Android:** bottom card with logo, one line copy, **Install** + **Not now**.
- **iOS:** same card but copy = “Tap Share → Add to Home Screen” + optional illustration.
- Animate in once after ~5s on page or on scroll (not immediate — less annoying).

### Step 3 — Wire in `conditional-site-chrome.tsx` or `layout`
- Render `<PwaInstallPrompt />` on storefront only (not `/cart` checkout flow if too intrusive — optional).
- Skip on admin routes (admin is separate app on Vercel).

### Step 4 — Manifest polish
- Add PNG icons to `manifest.ts`.
- Optional: `apple-mobile-web-app-capable` meta via Next.js `metadata` in `layout.tsx`.

### Step 5 — Test matrix
- Android Chrome: banner → Install → icon on home screen.
- iOS Safari: guide only.
- Dismiss → doesn’t show again for 7 days.
- Already installed → no prompt.

**Estimated effort:** ~1–2 hours  
**Files touched:** ~4–5 (all under `frontend/src/`)

---

## What we are NOT building (yet)

- Service worker / offline cache
- Push notifications
- Play Store / App Store listing

---

## Decision

| Option | Recommendation |
|--------|----------------|
| Custom install popup | ✅ Good for Android UX |
| iOS guide card | ✅ Required (no alternative) |
| Aggressive full-screen modal | ❌ Avoid |

Say **implement** when ready to code.
