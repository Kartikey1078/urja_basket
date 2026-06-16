# Urja Basket — Project Audit & Roadmap

> Generated audit of the monorepo: what's solid, what to fix, and what to build next.  
> Apps: `frontend/` (storefront), `admin/` (ops), `server/` (API).

---

## Table of contents

1. [Project snapshot](#project-snapshot)
2. [What's good — keep building](#whats-good--keep-building)
3. [What needs improvement](#what-needs-improvement)
4. [What not to over-invest in now](#what-not-to-over-invest-in-now)
5. [New features to implement](#new-features-to-implement)
6. [Suggested roadmap](#suggested-roadmap)
7. [Scorecard](#scorecard)
8. [Key file reference](#key-file-reference)

---

## Project snapshot

| App | Role | Stack | Port |
|-----|------|-------|------|
| `frontend/` | Customer storefront | Next.js 16, Clerk, TanStack Query, Zustand | 3000 |
| `admin/` | Operations console | Next.js 16, JWT session + API proxy | 3001 |
| `server/` | API + business logic | Express 5, MySQL, Razorpay, Clerk | 4000 |

**How they connect**

```
Browser (storefront :3000)
  → Next rewrites /api/v1/*, /api/me → Express :4000
  → Clerk JWT on authenticated calls

Admin (:3001)
  → /api/backend/* BFF proxy → Express /api/v1/admin/*
  → ADMIN_API_KEY (Bearer) + httpOnly JWT session cookie

Express (:4000)
  → MySQL (migrations in server/database/migrations/)
  → Clerk middleware; requireApiAuth on protected routes
```

The project has a real commerce backbone — cart, checkout, orders, coupons, admin CRUD, and nutrition tags are wired end-to-end.

---

## What's good — keep building

### Backend & data

- [x] **Module structure** — `routes → controllers → services → repositories` per domain (`server/src/modules/*`)
- [x] **SQL migrations** — catalog, cart, orders, payments, coupons, nutrition tags (`001`–`013`)
- [x] **Server-side cart pricing** for logged-in users (delivery fee, coupons, tax fields)
- [x] **Typed DB errors** with migration hints (`server/src/errors/mapDbError.ts`)

### Commerce flows

- [x] **Hybrid cart** — guest (localStorage + Zustand) + logged-in (MySQL) with sync on login
- [x] **Checkout on `/cart`** — address, delivery slot, Razorpay + COD
- [x] **Guest checkout** supported
- [x] **Order tracking** with timeline + guest phone lookup
- [x] **Coupon system** — rich schema, preview, abuse logs, admin analytics

### Admin console

- [x] **BFF proxy** hides `ADMIN_API_KEY` from browser (`admin/src/app/api/backend/[...path]/route.ts`)
- [x] **Full ops coverage** — products, variants, inventory, orders, customers, coupons, reviews, settings, staff
- [x] **Live analytics** from real DB data

### Storefront UX & brand

- [x] **Urja brand system** — `urja-forest`, `urja-gold`, `urja-cream`
- [x] **Category listing** — sort, price, organic, nutrition filters
- [x] **Nutrition tags** — admin catalog + storefront filter row (key differentiator)
- [x] **Loading skeletons**, same-origin API proxy, Clerk user sync

**Do not rip these out — extend them.**

---

## What needs improvement

### Critical — production blockers

| # | Area | Issue | Location / notes |
|---|------|--------|------------------|
| C1 | Product page | `/products/[slug]` is a stub — no variants, add-to-cart, reviews | `frontend/src/app/products/[slug]/page.tsx` |
| C2 | Inventory | No stock decrement on order placement | Order flow in `server/src/modules/orders/` |
| C3 | Pricing drift | Guest cart uses hardcoded fees; server uses `site_settings` | `frontend/src/lib/cart/constants.ts` vs `cart-pricing.service.ts` |
| C4 | Reviews API | Accepts arbitrary `userId` in body — no Clerk binding | `server/src/modules/products/`, `review.service.ts` |
| C5 | Testing | Zero automated tests | No `*.test.ts` / `*.spec.ts` in repo |
| C6 | CI/CD | No GitHub Actions or pipeline | No `.github/workflows/` |
| C7 | Payments | No Razorpay webhook — relies on client callback | `server/src/modules/payments/` |

### High priority — UX gaps users will notice

| # | Area | Issue | Location / notes |
|---|------|--------|------------------|
| H1 | Search | Header search is decorative — no API, no results page | `site-header.tsx` |
| H2 | Bestsellers | `/bestsellers` uses demo data; home section uses real API | `frontend/src/app/bestsellers/page.tsx` |
| H3 | Combos | Nav link exists but no page (404) | `/combos` |
| H4 | Settings | `GET /api/v1/settings` not consumed on storefront | COD toggle, fees, maintenance mode ignored |
| H5 | Wishlist | Client-only — no server sync | `frontend/src/stores/wishlist-store.ts`; server scaffold empty |
| H6 | Location | Hardcoded “Panipat” in header vs real address flow | `site-header.tsx` |

### Medium — tech debt

| # | Area | Issue |
|---|------|--------|
| M1 | Empty modules | Scaffold only: `notifications`, `uploads`, `cron`, `jobs`, `wishlist` (server) |
| M2 | Redis | Listed in `.env.example` but unused in code |
| M3 | Rate limiting | Coupon limit is in-process `Map` — breaks with multiple server instances |
| M4 | Image upload | Cloudinary env vars present; no admin upload integration |
| M5 | Logging | No structured logging (pino/winston mentioned in docs, not implemented) |
| M6 | Clerk sync | `/api/me` hits Clerk API + MySQL write every login — see root `issues` doc |
| M7 | Legacy root | Root `package.json` is unrelated React Router / Three.js cruft |
| M8 | Admin auth | Shared `ADMIN_API_KEY` + app password — no RBAC beyond role field |
| M9 | STRUCTURE.md | Outdated — says handlers not implemented |

### Security notes

- Payment verify is unauthenticated (signature-only) — acceptable if webhook added
- Clerk test keys in `server/.env.example` — ensure production uses live keys only in env, not committed
- Admin API key must never ship to storefront bundle (currently correct via BFF)

---

## What not to over-invest in now

| Item | Reason |
|------|--------|
| 3D / Three.js (root `package.json`) | Not connected to live apps |
| Barcode scan button | UI only; defer until PDP + inventory are solid |
| Blog / content hub | Brand nice-to-have after core shopping works |
| Multi-warehouse / corporate gifting | Premature before single-location ops are tight |
| Full admin auth rewrite | BFF + JWT pattern is adequate for internal ops now |

---

## New features to implement

### Tier 1 — Highest ROI (do next)

| # | Feature | Why |
|---|---------|-----|
| T1-1 | **Full product detail page (PDP)** | Images, variant picker, stock, nutrition tags, add-to-cart, related products |
| T1-2 | **Product search** | Backend endpoint + results page; wire header search |
| T1-3 | **Unify pricing from `site_settings`** | Guests and server use same delivery/platform fees |
| T1-4 | **Stock check at checkout** | Block/warn OOS; decrement on order confirm |
| T1-5 | **Razorpay webhooks** | Reliable server-side payment confirmation |
| T1-6 | **Fix bestsellers page** | Same API as home bestsellers section |

### Tier 2 — Brand differentiators

| # | Feature | Why |
|---|---------|-----|
| T2-1 | **Nutrition journeys** | “Shop by goal” — Immunity, Protein, etc. (extend current tags) |
| T2-2 | **Organic / clean-label badges** | `is_organic` + tags on cards and PDP |
| T2-3 | **Weekly Urja Basket subscription** | Curated organic box, skip/pause |
| T2-4 | **Smart reorder** | “Order again” from order history |
| T2-5 | **Recipe → product links** | e.g. almond ladoo → almonds, dates |

### Tier 3 — Growth & operations

| # | Feature | Notes |
|---|---------|--------|
| T3-1 | Referral program UI | `referral` coupon type exists in schema |
| T3-2 | Pincode serviceability | “Do we deliver to you?” |
| T3-3 | WhatsApp order updates | Constants already in `footer-constants.ts` |
| T3-4 | Image upload in admin | Wire Cloudinary |
| T3-5 | Customer reviews on storefront | API exists; no UI |
| T3-6 | SEO | Sitemap, structured data, meta per category/PDP |
| T3-7 | Seasonal collections | “Mango season”, “Winter dry fruit box” |
| T3-8 | Nutrition tag analytics (admin) | Which tags drive conversion |
| T3-9 | Gift hamper builder | Fits `gift-hampers` category |
| T3-10 | QR product authenticity | Wire header `ScanLine` + `html5-qrcode` |

### Missing features (grocery / organic baseline)

**Customer-facing**

- Account/profile hub (addresses beyond checkout)
- Order cancellation / returns / refunds
- Invoice/receipt download
- Real-time notifications (SMS, email, WhatsApp)
- Gift message / advanced scheduled delivery

**Operations**

- Delivery partner / driver tracking
- Multi-location inventory
- GST invoicing (tax field exists; rate defaults to 0)
- Audit logs beyond coupon abuse

**Content**

- “From the Forest” sourcing / farmer stories
- Loyalty points / membership

---

## Suggested roadmap

### Phase 1 — Make it shoppable (4–6 weeks)

- [ ] C1 — Full PDP + variant add-to-cart
- [ ] H1 — Product search
- [ ] C3 / T1-3 — Pricing from `site_settings` on storefront
- [ ] C2 / T1-4 — Stock at checkout + decrement on order
- [ ] C7 / T1-5 — Razorpay webhooks
- [ ] H2 / T1-6 — Bestsellers page uses API

### Phase 2 — Polish & trust (4 weeks)

- [ ] H3 — `/combos` page or remove nav link
- [ ] H4 — Storefront reads `site_settings`
- [ ] T3-5 — Reviews UI on storefront
- [ ] H5 — Wishlist server sync
- [ ] C4 — Secure reviews API (Clerk-bound)
- [ ] C5 / C6 — Basic tests + CI pipeline

### Phase 3 — Urja differentiation (ongoing)

- [ ] T2-1 — Nutrition journeys + PDP nutrition block
- [ ] T2-3 — Subscription box
- [ ] T2-4 / T3-1 — Reorder + referral
- [ ] T3-2 / T3-3 — Pincode + WhatsApp notifications
- [ ] M4 / T3-4 — Admin image upload

---

## Scorecard

| Area | Rating | Note |
|------|--------|------|
| Backend architecture | ⭐⭐⭐⭐ | Strong foundation |
| Admin console | ⭐⭐⭐⭐ | Feature-rich |
| Cart & checkout | ⭐⭐⭐½ | Works; pricing + webhooks need work |
| Catalog & filters | ⭐⭐⭐⭐ | Nutrition tags are a plus |
| Product discovery | ⭐⭐ | No PDP, no search |
| Security | ⭐⭐½ | Reviews, webhooks, admin auth gaps |
| Testing & DevOps | ⭐ | Biggest gap |
| Brand UX | ⭐⭐⭐½ | Good shell; needs PDP + content |

---

## Key file reference

| Area | Path |
|------|------|
| API routes | `server/src/api/v1/routes/index.ts` |
| Admin routes | `server/src/modules/admin/admin.routes.ts` |
| Migrations | `server/database/migrations/` |
| Cart store | `frontend/src/stores/cart-store.ts` |
| Checkout hook | `frontend/src/hooks/use-checkout.ts` |
| Guest cart pricing | `frontend/src/lib/cart/constants.ts` |
| Server cart pricing | `server/src/modules/cart/cart-pricing.service.ts` |
| Category listing | `frontend/src/components/category-listing/category-product-listing-client.tsx` |
| Nutrition filters | `frontend/src/components/category-listing/category-nutrition-filter-row.tsx` |
| Admin nav | `admin/src/config/navigation.ts` |
| Site settings | `server/src/modules/settings/` |
| Env templates | `frontend/.env.example`, `admin/.env.example`, `server/.env.example` |
| Clerk sync notes | `issues` (auth architecture review) |
| Cart notes | `cartIssues.md`, `cartdesign.md`, `cartform.md` |

---

## Summary

**Strongest:** server + admin + cart/checkout — do not rebuild.

**Biggest gaps:** product discovery (PDP, search), pricing/inventory consistency, production hardening (tests, webhooks, security).

**Differentiator:** nutrition tags and organic positioning — invest after core shopping is complete.
