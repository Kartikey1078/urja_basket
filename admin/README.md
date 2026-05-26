# Urja Basket — Admin (Next.js)

Separate operations console. It does **not** live inside the customer `frontend/` app.

## What it does

- **JWT session cookie** after you sign in with `ADMIN_APP_PASSWORD` (set in this app’s env).
- **BFF proxy** at `/api/backend/*` forwards to the Node server `GET|POST|PATCH|DELETE /api/v1/admin/*` using `ADMIN_API_KEY` (never sent to the browser).
- **TanStack Query** for server state; **Zustand** for shell UI (mobile sidebar).

## Run locally

1. Start API (port **4000** by default) with `ADMIN_API_KEY` set — same key as in this app’s env.
2. Copy `.env.example` → `.env.local` and fill values.
3. `npm install` && `npm run dev` → [http://localhost:3001](http://localhost:3001)

Customer storefront stays on `frontend` (e.g. port 3000).

## Env

| Variable | Where | Purpose |
|----------|--------|---------|
| `ADMIN_APP_PASSWORD` | admin `.env.local` | Sign-in password for the console UI |
| `ADMIN_SESSION_SECRET` | admin `.env.local` | JWT signing secret (**≥ 32 chars**) |
| `ADMIN_API_KEY` | admin `.env.local` | Same value as Express `ADMIN_API_KEY`; used only in Route Handlers |
| `INTERNAL_API_URL` | admin `.env.local` | API base, e.g. `http://127.0.0.1:4000` |
| `NEXT_PUBLIC_API_URL` | admin `.env.local` | Optional fallback if `INTERNAL_API_URL` is unset |

## Implemented vs roadmap

Connected to the existing API today: **categories**, **products** (+ variants), **reviews**, and **dashboard** counts.

Placeholder screens (until matching APIs exist): **orders**, **customers**, **coupons**, **inventory**, **analytics**, **settings**, **admin users**.
