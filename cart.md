# Cart — hybrid guest + authenticated

## Behavior

| User | Storage |
|------|---------|
| Guest | Zustand + `localStorage` (`urja-cart-v1`) |
| Logged in | MySQL via Express `/api/v1/cart/*` |
| Guest → login | `POST /api/v1/cart/sync` merges quantities, clears local cart |

## Backend APIs (auth required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/cart` | Fetch cart + server totals |
| POST | `/api/v1/cart/items` | Add / increase quantity |
| PATCH | `/api/v1/cart/items/:id` | Update line quantity |
| DELETE | `/api/v1/cart/items/:id` | Remove line |
| POST | `/api/v1/cart/sync` | Merge guest cart after login |

## Database setup

```bash
# From server/ — apply schema (once)
mysql -u root -p urja_basket < db/cart-schema.sql
mysql -u root -p urja_basket < db/seed-cart.sql   # optional demo
```

Or run `database/migrations/004_cart_tables.sql` via your migration flow.

## Frontend route

**http://localhost:3000/cart**

## Key files

- `server/db/cart-schema.sql`, `server/db/seed-cart.sql`
- `server/src/modules/cart/*`
- `frontend/src/stores/cart-store.ts`
- `frontend/src/lib/cart/api.ts`
- `frontend/src/components/clerk-user-sync.tsx` (triggers cart sync after login)
