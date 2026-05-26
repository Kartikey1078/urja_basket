# Urja Basket — backend layout

This document matches **ticket_1**: folder tree, one-line purpose per area, and where to add new features. No HTTP handlers are implemented yet; this is scaffolding only.

**Data layer:** MySQL via **`mysql2`** (connection pool in `src/database/`). Repositories run **parameterized SQL** only — **no Prisma, no ORM**. Schema changes are **versioned `.sql` files** in `database/migrations/`.

## Where root-level files live

| Location | Purpose |
|----------|---------|
| `server/package.json` | Dependencies, npm scripts (build, dev server). |
| `server/tsconfig.json` | TypeScript compiler options, `paths` aliases, `rootDir` / `outDir`. |
| `server/.env` | **Local only (gitignored).** `DB_*` credentials and app secrets. |
| `server/.env.example` | Safe template listing required env vars (copy to `.env`). |
| `server/.gitignore` | Ignore `node_modules`, `dist`, `.env`, logs. |
| `server/database/migrations/` | Ordered SQL migrations (e.g. `001_init.sql`); apply via phpMyAdmin, CLI, or a small runner you add later. |

Application source lives under **`server/src/`**.

---

## Complete folder tree

```
server/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── STRUCTURE.md                 ← this file
├── database/
│   └── migrations/             ← versioned raw SQL (no Prisma)
│       └── .gitkeep
├── tickets/
│   └── ticket_1.md
└── src/
    ├── server.ts                ← app entry (bootstrap Express here later)
    ├── api/
    │   ├── v1/routes/         ← compose v1 routers from modules
    │   └── v2/routes/         ← future breaking API version
    ├── config/                ← env validation, app config objects
    ├── constants/             ← magic strings, HTTP codes, roles, etc.
    ├── types/                 ← shared TS types & ambient declarations
    ├── interfaces/            ← contracts (e.g. repository interfaces)
    ├── dto/                   ← cross-cutting request/response shapes
    ├── utils/                 ← small pure helpers (formatting, parsing)
    ├── helpers/               ← slightly larger reusable helpers
    ├── middleware/            ← auth, logging, rate-limit, error wrapper
    ├── errors/                ← custom error classes + error factory
    ├── logs/                  ← logger setup (pino/winston) + transports
    ├── cache/                 ← Redis client + cache helpers
    ├── uploads/               ← multer/local temp; Cloudinary adapter hooks
    ├── cron/                  ← scheduled tasks (node-cron / workers)
    ├── events/                ← domain events pub/sub (in-proc or bus)
    ├── jobs/                  ← queue producers/consumers (BullMQ etc.)
    ├── database/              ← mysql2 pool, query helpers, seeds, DB health
    └── modules/               ← one folder per business capability
        ├── auth/
        ├── users/
        ├── products/
        ├── categories/
        ├── product-variants/
        ├── inventory/
        ├── cart/
        ├── wishlist/
        ├── orders/
        ├── payments/
        ├── reviews/
        ├── addresses/
        ├── notifications/
        └── admin/
```

Each module under `src/modules/<name>/` repeats the same slice:

```
<module>/
├── routes/         ← HTTP route definitions (thin; call controllers)
├── controllers/  ← parse request, call service, map to HTTP response
├── services/     ← business rules, orchestration, transactions
├── repositories/ ← SQL via mysql2 (parameterized); no business rules
├── validators/   ← request validation (e.g. Zod/Joi) for this module
└── dto/           ← module-specific DTOs (input/output shapes)
```

---

## One-line purpose (cross-cutting `src/` folders)

| Folder | Purpose |
|--------|---------|
| `src/api/v1/routes` | Mount module routers under `/api/v1/...` without business logic. |
| `src/api/v2/routes` | Same for the next API version when you introduce breaking changes. |
| `src/config` | Load and validate environment; export typed configuration. |
| `src/constants` | App-wide fixed values to avoid scattered literals. |
| `src/types` | Shared TypeScript types used across modules. |
| `src/interfaces` | Abstractions (e.g. `IEmailService`) for testing and swapping impls. |
| `src/dto` | DTOs shared by multiple modules (module-specific DTOs stay in `modules/*/dto`). |
| `src/utils` | Stateless utilities (dates, money, slugs). |
| `src/helpers` | Reusable glue (pagination builders, response mappers). |
| `src/middleware` | Express middleware: auth, CORS, request id, error boundary. |
| `src/errors` | Typed errors and mapping to HTTP status + JSON shape. |
| `src/logs` | Centralized logging configuration. |
| `src/cache` | Redis (or other) connection and cache-aside helpers. |
| `src/uploads` | File upload pipeline; integrate Cloudinary from here. |
| `src/cron` | Time-based jobs (cleanup, reminders). |
| `src/events` | Emit/handle domain events (order placed, stock low). |
| `src/jobs` | Async work via queues (emails, PDFs, webhooks). |
| `src/database` | `mysql2` pool/singleton, transactions, optional seed scripts. |

---

## Core modules (under `src/modules/`)

| Module | Purpose |
|--------|---------|
| `auth` | Login, register, tokens, sessions, password flows. |
| `users` | Profiles, roles, account settings (distinct from auth tokens). |
| `products` | Catalog items (fruits / dry fruits metadata, SEO, visibility). |
| `categories` | Category tree, ordering, filters. |
| `product-variants` | Sellable SKUs (250g, 500g, 1kg) tied to products + pricing. |
| `inventory` | Stock levels, reservations, adjustments, low-stock rules. |
| `cart` | Session/user cart lines referencing variants. |
| `wishlist` | Saved items per user. |
| `orders` | Checkout, order lifecycle, fulfillment status. |
| `payments` | Payment intents, webhooks, reconciliation. |
| `reviews` | Ratings and text reviews for products. |
| `addresses` | Shipping/billing addresses for users. |
| `notifications` | Email/SMS/push templates and delivery records. |
| `admin` | Admin-only operations (moderation, bulk updates, reports). |

---

## Where to add future features

1. **New business area (e.g. coupons, subscriptions)**  
   Add `src/modules/<feature>/` with the same six subfolders (`routes`, `controllers`, `services`, `repositories`, `validators`, `dto`). Register its router from `src/api/v1/routes/`.

2. **Shared behavior used by many modules**  
   Put it in `src/middleware`, `src/utils`, `src/helpers`, or `src/dto` / `src/types` depending on whether it is HTTP-specific, logic, or data shape.

3. **Database / schema changes**  
   Add a new numbered SQL file under `database/migrations/` (e.g. `002_add_orders.sql`), review it, then apply to MySQL (phpMyAdmin import, `mysql` CLI, or a migration tool you adopt). Keep repositories in sync with the live schema.

4. **New API version**  
   Copy composition pattern from `src/api/v1/routes` into `v2`, mount under `/api/v2`, and keep old routes stable for clients.

5. **Infrastructure (Redis, Cloudinary, cron)**  
   Keep adapters in `src/cache`, `src/uploads`, `src/cron` so modules stay testable and swap-friendly.

---

## Naming conventions (TypeScript)

- **Folders:** `kebab-case` (e.g. `product-variants`).
- **Files:** `camelCase` or `kebab-case.routes.ts` — pick one team-wide; common pattern is `*.routes.ts`, `*.controller.ts`, `*.service.ts`, `*.repository.ts`.
- **Classes:** `PascalCase`; **functions/variables:** `camelCase`; **constants:** `SCREAMING_SNAKE_CASE` in `src/constants`.

This keeps the codebase **modular**, **testable** (services + repositories), and **easy to extend** with new modules without touching unrelated features.
