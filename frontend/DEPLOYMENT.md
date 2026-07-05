# Urja Basket Storefront — Vercel deployment

Deploy the Next.js storefront on [Vercel](https://vercel.com). The Express API runs separately (e.g. AWS EC2).

## 1. Import the project

1. Vercel → **Add New → Project** → import `Kartikey1078/urja_basket`
2. **Root Directory:** `frontend` (required — monorepo)
3. Framework preset: **Next.js** (auto-detected)
4. Build settings (from `vercel.json`):
   - Install: `npm ci`
   - Build: `npm run build`

## 2. Environment variables

Set these in **Project → Settings → Environment Variables** for **Production** (and Preview if needed):

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_API_URL` | Yes | Public API URL, no trailing slash (e.g. `https://api.yourdomain.com`) |
| `NEXT_PUBLIC_ADMIN_URL` | Yes | Admin app URL (e.g. `https://admin.yourdomain.com`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key (same app as API) |
| `CLERK_SECRET_KEY` | Yes | Clerk secret (server-only) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | Must match server `RAZORPAY_KEY_ID` |
| `NODE_ENV` | Auto | Vercel sets `production` on deploy |

**Do not set `PORT` on Vercel** — the platform assigns the port.

`NEXT_PUBLIC_*` values are baked at **build time**. After changing them, trigger a **Redeploy**.

## 3. Wire backend + Clerk

### API (`server/.env` on EC2)

Add your Vercel storefront URL to CORS:

```env
CORS_ORIGIN=https://your-store.vercel.app,https://shop.yourdomain.com,https://admin.yourdomain.com
```

Redeploy/restart the API after updating.

### Clerk dashboard

1. **Allowed origins:** Vercel URL + custom domain
2. **Sign-in URL:** `https://your-domain/login`
3. Use **production** Clerk keys in Vercel and on the API

## 4. Custom domain (optional)

Vercel → Project → **Domains** → add `shop.yourdomain.com` and follow DNS instructions.

Update `CORS_ORIGIN` and Clerk allowed origins with the final domain.

## 5. How API routing works on Vercel

- **Browser:** fetches same-origin `/api/v1/*` → Next.js **rewrites** → `NEXT_PUBLIC_API_URL`
- **SSR:** server components fetch `NEXT_PUBLIC_API_URL` directly

The API must be reachable from Vercel’s build/runtime network (public HTTPS endpoint).

## 6. Product images

`<Image>` only loads hosts listed in `next.config.ts` → `images.remotePatterns`.  
Add your CDN/S3 hostname before using real product image URLs from admin.

## 7. Deploy updates

Push to the connected Git branch — Vercel deploys automatically.

Manual redeploy: Vercel dashboard → **Deployments → Redeploy**.

## 8. Verify

- [ ] Home page and categories load
- [ ] `/login` — Clerk sign-in
- [ ] Cart and checkout
- [ ] Razorpay payment
- [ ] `/admin` redirects to admin URL

## Local development

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

See also: `server/DEPLOYMENT.md` for API on AWS EC2.
