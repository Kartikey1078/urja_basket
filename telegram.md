# Telegram Bot Integration — Implementation Plan

Urja Basket · Admin order alerts via Telegram Bot API

---

## Goal

When a customer places an order (COD or online payment success), send an instant Telegram message to the admin/ops team — even when the admin panel is closed.

This complements the existing **SSE** live updates on `/orders` (admin panel must be open). Telegram works on phone 24/7.

---

## What you need from BotFather

| Item | Description | Where it lives |
|------|-------------|----------------|
| **Bot token** | From `@BotFather` → `/newbot` | `server/.env` only |
| **Chat ID** | Your personal chat or team group ID | `server/.env` only |

> **Note:** BotFather only creates the bot and gives the token. Your server calls the **Telegram Bot API** (`api.telegram.org`) to send messages.

---

## Architecture (fits existing project — no new system)

```
Customer checkout (COD / Razorpay)
        ↓
order.service.ts
        ├── notifyAdmins()      ← already exists (SSE → admin /orders page)
        └── notifyTelegram()    ← NEW (HTTP → Telegram chat)
```

**Single EC2 Express server** · **No Redis** · **No WebSocket** · **No DB changes** · **No frontend changes**

Telegram send is **fire-and-forget** — if Telegram fails, the order still succeeds.

---

## Phase 1 — Outgoing alerts only (recommended first)

Admin receives push messages. No webhook, no bot commands, no incoming traffic.

### Message triggers

| Event | When | Source in code |
|-------|------|----------------|
| `order.created` | COD order placed | `createCheckoutWithCod()` ~line 396 |
| `order.updated` | Online payment verified (`status: paid`) | `completeRazorpayPayment()` ~line 650 |

### Optional later triggers (Phase 2)

| Event | Source |
|-------|--------|
| Order cancelled | `cancelOrderByAdmin()` |
| Fulfillment updated | `admin.orders.controller.ts` |
| POS order | `pos.controller.ts` |

---

## Step-by-step setup

### Step 1 — Create bot (BotFather)

1. Open Telegram → search `@BotFather`
2. Send `/newbot`
3. Name: `Urja Basket Alerts`
4. Username: `urja_basket_alerts_bot` (must be unique)
5. Copy the token:
   ```
   7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Step 2 — Get chat ID

**Personal alerts (just you):**

1. Open your new bot in Telegram
2. Send `/start`
3. Visit in browser:
   ```
   https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
   ```
4. Find `"chat": { "id": 987654321 }` → that is your chat ID

**Team alerts (recommended — kitchen/ops group):**

1. Create Telegram group: `Urja Orders`
2. Add the bot to the group
3. Send any message in the group
4. Call `getUpdates` again
5. Use the group `chat.id` (negative number, e.g. `-1001234567890`)

### Step 3 — Environment variables

Add to `server/.env` (never commit real values):

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_CHAT_ID=
TELEGRAM_ALERTS_ENABLED=true

# Optional — link in Telegram message to admin order detail
ADMIN_PUBLIC_URL=https://admin.yourdomain.com
```

Document placeholders in `server/.env.example`.

### Step 4 — Server files to add

| Action | File | Purpose |
|--------|------|---------|
| **New** | `server/src/modules/notifications/telegram.service.ts` | `sendTelegramMessage()` via Bot API |
| **New** | `server/src/modules/notifications/order-alerts.ts` | Format + send order alert text |
| **Edit** | `server/src/config/env.ts` | Read `TELEGRAM_*` env vars |
| **Edit** | `server/src/modules/orders/services/order.service.ts` | Call `notifyTelegramOrder()` after `notifyAdmins()` |
| **Edit** | `server/.env.example` | Document new env vars |

**Total: 2 new files, 3 edits. No new npm packages (use native `fetch`).**

---

## File-level design

### `telegram.service.ts`

- `sendTelegramMessage(text: string): Promise<void>`
- POST `https://api.telegram.org/bot{token}/sendMessage`
- Body: `{ chat_id, text, parse_mode: "HTML" }`
- Guard: skip if `TELEGRAM_ALERTS_ENABLED !== "true"` or token/chat_id missing
- Wrap in `try/catch` — log error, never throw (order flow must not break)

### `order-alerts.ts`

- `notifyTelegramOrder(event, details?)` — maps `AdminOrderEvent` to human-readable HTML message
- Reuse event types from `server/src/realtime/admin-notify.ts`:
  - `order.created` → COD new order
  - `order.updated` + `status: "paid"` → online payment received

### Sample messages

**COD:**
```
🛒 New COD Order
Order: UB-20260716-0042
Customer: Rahul Sharma
Phone: 9876543210
Total: ₹847.00
View: https://admin.yourdomain.com/orders/42
```

**Online paid:**
```
💳 Payment Received
Order: UB-20260716-0043
Total: ₹1,240.00
Payment: Online (Razorpay)
View: https://admin.yourdomain.com/orders/43
```

### `order.service.ts` hooks

After each existing `notifyAdmins()` call, add:

```ts
notifyTelegramOrder(event, {
  customerName,
  customerPhone,
  grandTotal,
  paymentMethod,
});
```

Pass data already available in `ctx` / `order` — no extra DB query.

---

## Security checklist

- [ ] `TELEGRAM_BOT_TOKEN` only in `server/.env` — never frontend, never admin, never Git
- [ ] `TELEGRAM_ADMIN_CHAT_ID` server-side only
- [ ] Telegram failure does not block checkout
- [ ] No customer-facing Telegram in Phase 1 (no PII sent to wrong chats)
- [ ] If adding webhook later (Phase 2), use secret path + validate `X-Telegram-Bot-Api-Secret-Token`

---

## Testing plan

### 1. Verify bot token
```bash
curl "https://api.telegram.org/bot<TOKEN>/getMe"
```
Expected: `"ok": true`

### 2. Send test message
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id":"<CHAT_ID>","text":"Urja Basket test ✅"}'
```

### 3. Integration test
1. Set env vars, restart API server
2. Place COD order on storefront
3. Telegram message should arrive within 1–2 seconds
4. Place online order → pay via Razorpay → second message on payment success

### 4. Failure test
- Set `TELEGRAM_ALERTS_ENABLED=false` → no message, order still works
- Wrong token → error logged, order still works

---

## Production (EC2)

| Item | Action |
|------|--------|
| Env vars | Add to `server/.env` on EC2 |
| Outbound network | Allow `https://api.telegram.org` (default open) |
| PM2 | `pm2 restart urja-api` after env change |
| Dependencies | None — native `fetch` in Node 20+ |
| Monitoring | Check server logs for `[telegram] send failed` |

No Nginx changes needed (outgoing HTTP only).

---

## SSE vs Telegram — use both

| Channel | Works when | Requests |
|---------|------------|----------|
| **SSE** (existing) | Admin `/orders` page open | 1 long-lived connection |
| **Telegram** (new) | Admin phone, anytime | 1 HTTP per order event |

---

## Phase 2 — Optional enhancements (later)

| Feature | Effort | Notes |
|---------|--------|-------|
| Admin link in every message | 15 min | Needs `ADMIN_PUBLIC_URL` env |
| Cancel / fulfillment alerts | 30 min | More `notifyTelegramOrder()` calls |
| POS order alerts | 15 min | Hook in `pos.controller.ts` |
| Bot `/orders` command | 1–2 days | Needs webhook endpoint + auth |
| Customer delivery updates | 2–3 days | Customer must `/start` bot (get their chat_id) |
| Multiple chat IDs | 1 hr | Comma-separated `TELEGRAM_ADMIN_CHAT_ID` |

**Do not build Phase 2 until Phase 1 is live and tested.**

---

## Implementation order

```
1. BotFather → get token
2. /start or group → get chat_id
3. Add env vars to server/.env
4. Create telegram.service.ts
5. Create order-alerts.ts
6. Update env.ts
7. Hook order.service.ts (2 places)
8. Update .env.example
9. curl test → real order test
10. Deploy to EC2
```

**Estimated time:** 45–60 minutes  
**Risk:** Low — isolated module, non-blocking sends

---

## What NOT to do

- Do not put bot token in admin Next.js app
- Do not use Telegram instead of SSE (they solve different problems)
- Do not add Redis/EventEmitter for Phase 1
- Do not block order creation on Telegram response
- Do not commit `.env` with real token

---

## Ready to implement?

Once you have:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ADMIN_CHAT_ID`

…in `server/.env`, say **implement** and the code changes from this plan will be applied.
