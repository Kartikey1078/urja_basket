Upgrade the existing product card "Add to Cart" interaction to behave like a modern ecommerce quantity selector instead of a static button.

Current issue:

* Clicking "Add to Cart" only updates database/localStorage
* UI does not change on the product card
* User cannot directly increase/decrease quantity from the card

Implement dynamic cart controls directly inside every product card.

---

# Required UX Behavior

## Default State

If product quantity = 0:

Show button:

```txt id="1"
[ Add to Cart ]
```

---

## Added State

If product exists in cart:

Replace button with quantity stepper:

```txt id="2"
[-]  2  [+]
```

Where:

* `-` decreases quantity
* `+` increases quantity
* center shows current quantity
* quantity updates instantly
* smooth animation transition

---

# Quantity Rules

## Plus Button

When `+` clicked:

* increase quantity
* update Zustand store
* sync backend if logged in
* update localStorage if guest
* optimistic UI update

---

## Minus Button

When `-` clicked:

If quantity > 1:

* decrease quantity

If quantity === 1:

* remove item completely
* revert UI back to:
  `Add to Cart`

---

# Important Logic

## Guest Users

Use:

* Zustand
* localStorage

---

## Logged-In Users

Use:

* backend APIs
* database persistence

---

# Product Card Requirements

Every product card must:

* read live quantity from cart store
* rerender automatically
* stay perfectly synced with cart
* support optimistic updates
* avoid flicker

---

# UI Design Requirements

Design should match premium grocery apps like:

* Blinkit
* Zepto
* Instamart

Style requirements:

* rounded quantity pill
* smooth hover states
* premium green theme
* subtle shadows
* animated transitions
* mobile responsive
* compact layout

---

# Required Component Structure

Create reusable component:

```txt id="3"
components/cart/QuantityButton.tsx
```

This component should:

* detect existing quantity
* switch between:

  * Add to Cart button
  * Quantity stepper
* connect to Zustand cart store

---

# Required Store Methods

Ensure cart store supports:

```ts id="4"
getItemQuantity(productId)
addItem(product)
increaseQuantity(productId)
decreaseQuantity(productId)
removeItem(productId)
```

---

# Required Product Card Logic

Inside product card:

```tsx id="5"
const quantity = getItemQuantity(product.id)
```

If quantity === 0:

* show Add to Cart

Else:

* show quantity stepper

---

# Animation Requirements

Use smooth transitions for:

* Add to Cart → Quantity Stepper
* Quantity changes
* Remove animation

Use:

* Framer Motion OR Tailwind transitions

---

# Backend Sync Rules

## Logged-In Users

Every quantity change should:

* sync database
* debounce requests
* avoid duplicate API calls
* rollback on API failure

---

# Edge Cases

Handle:

* rapid clicking
* network failures
* product out of stock
* invalid quantities
* cart desync
* refresh persistence

---

# Performance

* avoid rerendering entire product grid
* memoize quantity selectors
* efficient Zustand selectors
* optimistic updates

---

# Final Result

The product cards should behave exactly like modern quick-commerce apps:

Before:

```txt id="6"
[ Add to Cart ]
```

After adding:

```txt id="7"
[-] 1 [+]
```

And update live across:

* cart page
* navbar cart count
* product listings
* product detail pages
