# Urja Basket — POS Module Master Prompt

> **How to use:** Copy everything under **“MASTER PROMPT (copy from here)”** into Cursor / Claude / another agent to build the POS. Requirements below are the source of truth for Urja Basket.

---

## MASTER PROMPT (copy from here)

You are building a **Point of Sale (POS) module** for **Urja Basket**, an existing monorepo with:

| App | Path | Port | Role |
|-----|------|------|------|
| Storefront | `frontend/` | 3000 | Online customers |
| Admin | `admin/` | 3001 | Catalog, orders, inventory |
| API | `server/` | 4000 | Express + MySQL |

### Non‑negotiable rules

1. **Single source of truth for stock** — reuse `products.stock` and `product_variants.stock`. Do **not** duplicate product or inventory tables.
2. **Reuse existing inventory logic** — call the same deduction helpers used by online orders:
   - `server/src/modules/inventory/repositories/inventory.repository.ts` → `checkLineAvailability`, `deductLineStock`, `restoreLineStock`
   - `server/src/modules/inventory/services/order-inventory.service.ts` → patterns for transactional deduct/restore
3. **Deduct stock only after successful payment** — never on “Add to cart” or “Checkout started”.
4. **POS runs on a laptop** (primary) but must be **mobile-friendly** (touch targets ≥ 44px, responsive grid).
5. **Offline walk‑in customers** — no Clerk/login required at checkout; staff auth only.
6. **Pine Labs terminal** is used for Card and QR payments at the physical counter.

---

### Architecture (recommended)

```
admin/src/app/(pos)/pos/          → POS UI (billing + order history)
admin/src/features/pos/           → screens, hooks, cart store
server/src/modules/pos/           → routes, controller, service, repository
server/database/migrations/       → pos_orders, pos_order_items, pos_payments, inventory_movements (optional ledger)
```

- Add **`/pos`** route group in **admin** (same auth as admin — staff only).
- Add **`/api/v1/pos/*`** routes on **server** (protected by admin JWT / session).
- POS product search hits existing product APIs or thin POS wrappers with `inStock` filter and barcode/SKU fields.

**Do not** build POS inside `frontend/` (customer app).

---

### Database (new tables only)

Reuse: `products`, `product_variants`, `categories`.

Create migration `0xx_pos_tables.sql`:

```sql
-- pos_orders: walk-in sale header
CREATE TABLE pos_orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(32) NOT NULL UNIQUE,       -- e.g. POS-20260704-0042
  status ENUM('pending_payment','paid','cancelled','failed') NOT NULL DEFAULT 'pending_payment',
  subtotal DECIMAL(12,2) NOT NULL,
  discount DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax DECIMAL(12,2) NOT NULL DEFAULT 0,
  grand_total DECIMAL(12,2) NOT NULL,
  cashier_admin_user_id INT UNSIGNED NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  INDEX idx_pos_orders_status (status),
  INDEX idx_pos_orders_created (created_at)
);

-- pos_order_items: lines tied to product + optional variant
CREATE TABLE pos_order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pos_order_id BIGINT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  variant_id INT UNSIGNED NULL,
  product_name VARCHAR(255) NOT NULL,
  variant_label VARCHAR(64) NULL,                 -- weight label e.g. "500g"
  sku VARCHAR(64) NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (pos_order_id) REFERENCES pos_orders(id) ON DELETE CASCADE
);

-- pos_payments: cash / pine card / pine qr
CREATE TABLE pos_payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pos_order_id BIGINT UNSIGNED NOT NULL,
  method ENUM('cash','pine_card','pine_qr') NOT NULL,
  status ENUM('pending','success','failed','cancelled') NOT NULL DEFAULT 'pending',
  amount DECIMAL(12,2) NOT NULL,
  cash_received DECIMAL(12,2) NULL,
  cash_change DECIMAL(12,2) NULL,
  pine_transaction_id VARCHAR(128) NULL,
  pine_rrn VARCHAR(64) NULL,
  pine_raw_response JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (pos_order_id) REFERENCES pos_orders(id) ON DELETE CASCADE
);

-- inventory_movements: audit ledger (single ledger for online + POS)
CREATE TABLE inventory_movements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  variant_id INT UNSIGNED NULL,
  delta INT NOT NULL,                             -- negative = sale
  reason ENUM('pos_sale','online_sale','admin_adjustment','pos_cancel_restore','online_cancel_restore') NOT NULL,
  reference_type ENUM('pos_order','order','admin') NOT NULL,
  reference_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_movements_product (product_id)
);
```

On **successful payment**, inside one DB transaction:

1. Lock/check stock via `checkLineAvailability` per line.
2. `deductLineStock` per line.
3. Insert `inventory_movements` rows.
4. Set `pos_orders.status = 'paid'`, `paid_at = NOW()`.
5. Set `pos_payments.status = 'success'`.

On **cancel unpaid** order: set status `cancelled` only — no stock change.

On **refund/cancel paid** (future): `restoreLineStock` + movement rows.

---

### API endpoints (server)

Base: `/api/v1/pos` — all require admin auth.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/products/search?q=&barcode=&limit=20` | Fast search by name, slug, SKU, barcode; return id, name, image, price, mrp, stock, variants[] |
| POST | `/orders` | Create pending order from cart payload |
| GET | `/orders?status=&q=&from=&to=&page=` | List POS orders |
| GET | `/orders/:id` | Order detail + items + payment |
| POST | `/orders/:id/pay/cash` | Body: `{ receivedAmount }` → validate ≥ total, compute change, complete |
| POST | `/orders/:id/pay/pine/card` | Initiate Pine Labs card sale for `grand_total` |
| POST | `/orders/:id/pay/pine/qr` | Initiate Pine Labs QR flow |
| GET | `/orders/:id/pay/status` | Poll payment status (for card/QR waiting UI) |
| POST | `/orders/:id/cancel` | Cancel only if `status = pending_payment` |
| GET | `/orders/:id/invoice` | HTML/PDF payload for reprint |

**Performance requirements:**

- Product search < 150ms p95 (index on `products.name`, `product_variants.sku`; add `barcode` column if missing).
- Checkout transaction single round-trip; use connection pool + row-level `stock >= qty` updates (already in `deductLineStock`).
- Debounce search input 200ms client-side; React Query `staleTime: 10s` for product list.

---

### Pine Labs integration

Create `server/src/modules/pos/services/pine-labs.service.ts` as an adapter:

```ts
interface PineLabsService {
  initiateCardPayment(params: { orderId: string; amountPaise: number }): Promise<{ transactionId: string }>;
  initiateQrPayment(params: { orderId: string; amountPaise: number }): Promise<{ transactionId: string; qrPayload: string }>;
  getPaymentStatus(transactionId: string): Promise<'pending' | 'success' | 'failed' | 'cancelled'>;
}
```

- Read credentials from `server/.env`: `PINE_LABS_MERCHANT_ID`, `PINE_LABS_API_KEY`, `PINE_LABS_TERMINAL_ID`, `PINE_LABS_ENV=sandbox|production`.
- **Phase 1:** Implement interface with a **mock driver** + webhook/callback route `POST /api/v1/pos/pine/webhook` so UI can be built and tested without hardware.
- **Phase 2:** Wire real Pine Labs Plutus / Android integration per their SDK docs (amount sent to terminal, poll or push status).
- Card flow UI: full-screen overlay **“Waiting for card payment…”** with spinner + Cancel.
- QR flow UI: show QR + **“Waiting for payment…”** + poll every 2s until success/fail/timeout (120s).

**Cash flow:** modal → enter received amount → show change → Confirm → call `/pay/cash` → success toast → clear cart.

---

### POS Billing UI (`/pos`)

**Layout (desktop):** 2 columns — left 60% product grid/search, right 40% sticky cart.

**Layout (mobile):** stacked — search + product list on top; floating cart bar with total + “View cart” sheet.

#### Product section

- Search input (autofocus) — name, SKU, barcode scan (keyboard wedge).
- Product cards: image, name, weight/variant, price, **live stock badge** (green / amber low / red out).
- Tap product → if variants, open variant picker sheet; else add qty 1.
- Disable add when `stock === 0`.
- Cap quantity at available stock in cart.

#### Cart

- Line: name, variant, unit price, **− / qty / +**, line total, remove (red).
- Footer: subtotal, optional discount (phase 2), **grand total** (large).
- Actions: **Clear cart** (confirm), **Checkout** (primary blue).

#### Checkout sheet

- Payment tabs: **Cash** | **Card (Pine Labs)** | **QR**
- Cash: amount received input, change preview, **Complete sale**
- Card/QR: **Pay ₹X** → waiting state → success/fail
- On success: show receipt summary + **New sale** + **Print invoice**

Use existing admin toast (`adminToast`) for feedback.

---

### POS Order Management (`/pos/orders`)

Reuse admin table patterns from `admin/src/features/orders/orders-screen.tsx`:

- Filters: date range, status, payment method, order number search.
- Row: order #, total, payment method badge, status, time, cashier.
- Detail: items, payment block, reprint invoice, cancel (pending only).

---

### UI design system (POS-specific)

| Token | Value |
|-------|--------|
| Background | `bg-white` page, `bg-slate-50` panels |
| Primary CTA | `bg-blue-600 hover:bg-blue-700` (checkout, pay) |
| Success | `text-emerald-600`, `bg-emerald-50` |
| Danger | `text-red-600` — remove/cancel only |
| Typography | Large totals `text-2xl font-bold`; product names `text-base font-semibold` |
| Touch | Buttons min `h-12`, cart qty buttons `size-10` |

Keep POS visually distinct from emerald admin theme so staff instantly know they’re in billing mode.

---

### Auth & security

- Gate `/pos/*` with same admin session as dashboard (`admin` middleware).
- Optional: restrict POS to roles `owner`, `manager`, `staff` with new permission `pos:access`.
- Log `cashier_admin_user_id` on every order.
- Idempotency key header on payment endpoints to prevent double-charge on double-tap.

---

### Sync with online store

| Event | Stock effect |
|-------|----------------|
| Online order paid (Razorpay) | Deduct via existing `order-inventory.service` |
| Online COD confirmed | Deduct on confirm |
| POS sale paid | Deduct via same `deductLineStock` |
| POS product search | Read live `products` / `product_variants` stock |

Admin inventory screen (`/inventory`) must reflect POS sales immediately (same DB rows).

---

### Implementation phases

**Phase 1 — MVP (ship first)**  
- DB migration, product search API, cart UI, cash checkout, stock deduct + movements, order list/detail, invoice HTML print.

**Phase 2 — Pine Labs**  
- Mock driver + waiting UI, then real terminal integration, webhook/polling.

**Phase 3 — Polish**  
- Barcode column + scanner, discounts, daily Z-report, keyboard shortcuts (F2 search, F4 cash, Esc clear).

---

### Files to reference (do not rewrite inventory from scratch)

```
server/src/modules/inventory/repositories/inventory.repository.ts
server/src/modules/inventory/services/order-inventory.service.ts
server/src/modules/admin/admin.inventory.controller.ts
admin/src/features/inventory/inventory-screen.tsx
admin/src/lib/admin-toast.ts
server/database/migrations/001_core_catalog_tables.sql
```

---

### Acceptance criteria

- [ ] Selling 1 unit in POS reduces the same stock shown in Admin → Inventory and online product pages.
- [ ] Selling online reduces stock visible in POS search within one refresh.
- [ ] Cannot checkout more than available stock.
- [ ] Failed/cancelled Pine payment does not deduct stock.
- [ ] Cash payment shows correct change.
- [ ] POS usable on 375px mobile width and 1280px laptop.
- [ ] Product search feels instant (< 200ms perceived).
- [ ] Unpaid POS orders can be cancelled; paid orders cannot.

Build incrementally. Match existing code style (TypeScript, React Query, Tailwind, Express modules). Minimize new dependencies.

---

## END MASTER PROMPT

---

## Original requirements (summary)

- Reuse `products` + inventory tables; no duplicate stock.
- Supermarket-style billing: search, cart +/-, stock limits, checkout.
- Payments: **Cash** (change calculation), **Card (Pine Labs)**, **QR (Pine Labs)**.
- Deduct inventory only after successful payment.
- POS orders admin: search, detail, payment info, reprint, cancel unpaid only.
- Clean UI: white/gray, blue primary, green success, red destructive, touch-friendly, responsive.
