Upgrade the existing ecommerce project cart system to support BOTH guest carts and authenticated carts using the already configured project stack and existing architecture.

Do NOT recreate project setup, authentication setup, Tailwind setup, Zustand setup, or database connection setup because they already exist.

Focus ONLY on implementing the cart architecture, backend persistence, database schema, syncing logic, APIs, and production-grade cart behavior.

---

# Existing Current State

Current cart is frontend-only:

* Zustand store
* localStorage persistence
* Browser-side pricing
* No cart database persistence
* No backend cart APIs yet

The project already has:

* Clerk authentication
* Express backend
* MySQL database
* Product/catalog APIs
* User sync APIs
* Existing ecommerce frontend

---

# Goal

Implement a hybrid cart system:

| User Type      | Storage                  |
| -------------- | ------------------------ |
| Guest user     | localStorage + Zustand   |
| Logged-in user | MySQL database           |
| Guest → Login  | automatic cart sync      |
| Multi-device   | persistent database cart |

---

# Required Behavior

## Guest Users

If user is NOT logged in:

* Store cart in Zustand
* Persist using:
  `urja-cart-v1`
* Cart survives refresh
* All pricing calculated locally

---

## Logged-In Users

If user IS logged in:

* Fetch cart from backend
* Persist all changes in MySQL
* Cart survives logout/login
* Cart syncs across devices

---

# Guest → Login Sync

When guest user logs in:

1. Read localStorage cart
2. Send items to backend
3. Merge with existing DB cart
4. Sum duplicate quantities
5. Avoid duplicate line items
6. Clear localStorage after successful sync
7. Refresh Zustand state from backend

This sync must happen automatically.

---

# Required Backend APIs

## GET /api/v1/cart

Return authenticated user's cart.

---

## POST /api/v1/cart/items

Add item to cart.

If product already exists:

* increase quantity

Else:

* create line item

---

## PATCH /api/v1/cart/items/:id

Update quantity.

---

## DELETE /api/v1/cart/items/:id

Remove line item.

---

## POST /api/v1/cart/sync

Merge guest cart into authenticated cart.

---

# Database Work

Create new database schema file:

```txt
server/db/cart-schema.sql
```

Add tables:

## carts

* id
* user_id
* created_at
* updated_at

---

## cart_items

* id
* cart_id
* product_id
* quantity
* created_at

Add:

* foreign keys
* indexes
* unique cart/product constraint

---

# Seed Database

Create:

```txt
server/db/seed-cart.sql
```

Include:

* demo carts
* demo cart items

---

# Backend Structure

Create:

```txt
server/
 ├── routes/cart.routes.ts
 ├── controllers/cart.controller.ts
 ├── services/cart.service.ts
 ├── validators/cart.validator.ts
```

Follow existing backend architecture and conventions already used in the project.

---

# Zustand Store Upgrade

Update existing cart store.

Required methods:

```ts
addItem()
removeItem()
updateQuantity()
clearCart()
fetchCart()
syncCartAfterLogin()
```

Logic:

* Guest → localStorage
* Authenticated → backend APIs
* Automatic fallback handling
* Optimistic UI updates

---

# Cart Page Requirements

Upgrade existing cart page to production-quality ecommerce UX.

Features:

* Responsive layout
* Sticky summary section
* Quantity stepper
* Remove item button
* Savings breakdown
* Delivery estimate
* Empty cart state
* Loading skeletons
* Optimistic updates
* Smooth animations
* Mobile-first behavior

---

# Pricing Rules

Backend must calculate authoritative totals.

Frontend may calculate optimistic totals temporarily.

Pricing structure:

* subtotal
* deliveryFee
* platformFee
* discount
* tax
* grandTotal

---

# Security

* Validate authenticated user
* Never trust frontend totals
* Validate products exist
* Prevent invalid quantities
* Prevent cart tampering

---

# Performance

* Debounce quantity updates
* Minimize API calls
* Batch updates where possible
* Efficient Zustand updates

---

# Important Rules

* Reuse existing project structure
* Reuse existing database connection
* Reuse existing auth middleware
* Reuse existing API response helpers
* Reuse existing product tables
* Keep code scalable and modular
* Fully typed TypeScript
* Production-ready quality only
