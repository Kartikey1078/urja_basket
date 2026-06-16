# Deploy Urja Basket on Railway

This monorepo runs as **three Railway services** plus **one MySQL database**:

| Service | Root directory | Stack |
|---------|----------------|-------|
| API | `server/` | Node.js Express |
| Storefront | `frontend/` | Next.js |
| Admin | `admin/` | Next.js |
| Database | Railway MySQL plugin | MySQL 8 |

Each service reads **`process.env.PORT`** (set automatically by Railway). Do not hardcode ports in production.

---

## Prerequisites

1. [Railway](https://railway.app) account
2. GitHub repo connected (`Kartikey1078/urja_basket`)
3. [Clerk](https://clerk.com) production application
4. [Razorpay](https://razorpay.com) keys (if accepting payments)
5. Optional: external MySQL / phpMyAdmin host instead of Railway MySQL

---

## Step 1 — Create a Railway project

1. Go to **Railway → New Project → Deploy from GitHub repo**
2. Select `urja_basket`
3. You will add **4 resources** (3 services + 1 database)

---

## Step 2 — Add MySQL

1. In the project, click **+ New → Database → MySQL**
2. Open the MySQL service → **Variables** tab
3. Note these (Railway provides them automatically):
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

**phpMyAdmin:** Railway MySQL does not include phpMyAdmin. Options:

- Use **Railway CLI** + local client: `mysql -h $MYSQLHOST -P $MYSQLPORT -u $MYSQLUSER -p`
- Connect **phpMyAdmin** on another host using the public TCP proxy (enable in MySQL service → Networking → TCP Proxy)
- Use a desktop client (TablePlus, DBeaver)

---

## Step 3 — Deploy the API (`server/`)

1. **+ New → GitHub Repo → same repo**
2. Service settings → **Root Directory** = `server`
3. Railway reads `server/railway.toml`:
   - **Build:** `npm ci && npm run build`
   - **Release:** `npm run railway:release` (runs DB migrations)
   - **Start:** `npm start` → `node dist/server.js`
   - **Health check:** `/api/v1/health`

### API environment variables

Set in the API service **Variables** tab:

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Auto | Railway sets this — **do not override** |
| `CORS_ORIGIN` | Yes | Comma-separated public URLs of storefront + admin (see Step 6) |
| `ADMIN_API_KEY` | Yes | Long random secret (min 8 chars); same value on admin service |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `MYSQLHOST` | Yes* | Reference from MySQL service: `${{MySQL.MYSQLHOST}}` |
| `MYSQLPORT` | Yes* | `${{MySQL.MYSQLPORT}}` |
| `MYSQLUSER` | Yes* | `${{MySQL.MYSQLUSER}}` |
| `MYSQLPASSWORD` | Yes* | `${{MySQL.MYSQLPASSWORD}}` |
| `MYSQLDATABASE` | Yes* | `${{MySQL.MYSQLDATABASE}}` |
| `RAZORPAY_KEY_ID` | If payments | Razorpay key id |
| `RAZORPAY_KEY_SECRET` | If payments | Razorpay secret |

\* Or use `MYSQL_URL=mysql://user:pass@host:port/db` instead of individual `MYSQL*` vars.

**Optional**

| Variable | Description |
|----------|-------------|
| `DB_SSL` | `true` for TLS to external MySQL |
| `DB_POOL_LIMIT` | Connection pool size (default `10`) |

4. **Generate domain:** Settings → Networking → **Generate Domain**  
   Example: `https://urja-api-production.up.railway.app`

5. Verify:
   ```bash
   curl https://YOUR-API-DOMAIN/api/v1/health
   curl https://YOUR-API-DOMAIN/api/v1/health/db
   ```

---

## Step 4 — Deploy the storefront (`frontend/`)

1. **+ New → GitHub Repo → same repo**
2. **Root Directory** = `frontend`

### Storefront environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Auto | Railway sets this |
| `NEXT_PUBLIC_API_URL` | Yes | Public API URL from Step 3 (no trailing slash) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret (server components / auth) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | If payments | Same as API `RAZORPAY_KEY_ID` |
| `NEXT_PUBLIC_ADMIN_URL` | Yes | Public admin URL from Step 5 |

3. **Generate domain** for the storefront  
   Example: `https://urja-basket-production.up.railway.app`

4. Rebuild after setting `NEXT_PUBLIC_*` vars (Next.js bakes them at build time).

---

## Step 5 — Deploy the admin (`admin/`)

1. **+ New → GitHub Repo → same repo**
2. **Root Directory** = `admin`

### Admin environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Auto | Railway sets this |
| `ADMIN_APP_PASSWORD` | Yes | Operator login password for `/login` |
| `ADMIN_SESSION_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `ADMIN_API_KEY` | Yes | **Must match** API service `ADMIN_API_KEY` |
| `INTERNAL_API_URL` | Yes | Public API URL from Step 3 |

3. **Generate domain**  
   Example: `https://urja-admin-production.up.railway.app`

---

## Step 6 — Wire CORS and Clerk

### Update API `CORS_ORIGIN`

After you have storefront and admin domains:

```
CORS_ORIGIN=https://urja-basket-production.up.railway.app,https://urja-admin-production.up.railway.app
```

Redeploy the API service.

### Clerk dashboard

1. **Allowed origins:** add storefront + admin Railway URLs
2. **Redirect URLs:** add sign-in/sign-up URLs for the storefront
3. Use **production** Clerk keys in all three services

---

## Step 7 — First deploy checklist

- [ ] MySQL service running
- [ ] API deploy succeeded; release phase ran migrations
- [ ] `GET /api/v1/health/db` returns `{ "ok": true, "database": "connected" }`
- [ ] Storefront loads categories/products
- [ ] Admin login works at `/login`
- [ ] Clerk sign-in works on storefront
- [ ] Test checkout with Razorpay test/live keys

---

## All Railway environment variables (summary)

### API (`server/`)

```
NODE_ENV=production
CORS_ORIGIN=<storefront-url>,<admin-url>
ADMIN_API_KEY=<shared-secret>
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
MYSQLHOST=${{MySQL.MYSQLHOST}}
MYSQLPORT=${{MySQL.MYSQLPORT}}
MYSQLUSER=${{MySQL.MYSQLUSER}}
MYSQLPASSWORD=${{MySQL.MYSQLPASSWORD}}
MYSQLDATABASE=${{MySQL.MYSQLDATABASE}}
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

### Storefront (`frontend/`)

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=<api-public-url>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
NEXT_PUBLIC_ADMIN_URL=<admin-public-url>
```

### Admin (`admin/`)

```
NODE_ENV=production
ADMIN_APP_PASSWORD=
ADMIN_SESSION_SECRET=
ADMIN_API_KEY=<same-as-api>
INTERNAL_API_URL=<api-public-url>
```

### MySQL (auto-provided by Railway)

```
MYSQLHOST
MYSQLPORT
MYSQLUSER
MYSQLPASSWORD
MYSQLDATABASE
MYSQL_URL
```

---

## Local development

Copy env templates:

```bash
cp server/.env.example server/.env
cp frontend/.env.example frontend/.env.local
cp admin/.env.example admin/.env.local
```

Local defaults use `localhost` only when `NODE_ENV !== production`.

```bash
# Terminal 1 — API
cd server && npm install && npm run db:init && npm run dev

# Terminal 2 — Storefront
cd frontend && npm install && npm run dev

# Terminal 3 — Admin
cd admin && npm install && npm run dev
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API crash on start | Check Variables: `CLERK_SECRET_KEY`, MySQL refs, `CORS_ORIGIN` in production |
| `health/db` fails | Verify MySQL variables; check API and MySQL are in same Railway project |
| Storefront build fails | Set `NEXT_PUBLIC_API_URL` before build |
| CORS errors in browser | Add exact storefront URL to API `CORS_ORIGIN` and Clerk allowed origins |
| Admin 502 on data | Check `INTERNAL_API_URL` and matching `ADMIN_API_KEY` |
| Migrations failed | Run manually: `railway run npm run db:init` from `server/` (first time only) |

---

## Files added for Railway

| File | Purpose |
|------|---------|
| `server/railway.toml` | Build, release (migrations), health check |
| `server/scripts/railway-release.ts` | Auto-init or migrate on deploy |
| `server/src/config/db.ts` | MySQL env resolution (Railway + standard) |
| `frontend/railway.toml` | Next.js storefront deploy config |
| `admin/railway.toml` | Next.js admin deploy config |
| `.env.example` | Monorepo env overview |
| `server/.env.example` | API template (no localhost-only secrets) |
