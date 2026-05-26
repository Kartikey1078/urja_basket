Upgrade the checkout/cart page to include a production-ready delivery address system with:

* modern address form UI
* automatic location detection
* manual address entry
* saved addresses
* backend persistence
* mobile-first UX
* quick-commerce style flow like Blinkit / Zepto / Swiggy Instamart

Do NOT recreate project setup. Reuse existing architecture.

---

# Checkout Address Flow

When user clicks:

```txt id="1"
Proceed to Checkout
```

Open delivery address section/page.

---

# Required User Inputs

Create a premium address form with these fields:

## Personal Info

* Full Name
* Phone Number
* Alternate Phone Number (optional)

---

## Address Info

* House / Flat / Apartment Number
* Floor (optional)
* Building / Society Name
* Area / Street
* Landmark (optional)

---

## Location Info

* City
* State
* Pincode
* Country

---

# Address Type Selector

Add selectable pills:

```txt id="2"
[ Home ] [ Work ] [ Other ]
```

Selected type should highlight.

---

# Location Detection

Add button:

```txt id="3"
[ Use Current Location ]
```

---

# Current Location Behavior

When clicked:

1. Ask browser geolocation permission
2. Get latitude + longitude
3. Reverse geocode location
4. Autofill:

   * city
   * state
   * pincode
   * area
5. Allow user to edit manually

---

# Manual Address Entry

User must ALSO be able to:

* enter address manually
* edit autofilled fields
* save custom addresses

---

# Address Validation

Validate:

* Indian phone number
* pincode
* required fields
* minimum lengths

Prevent invalid submissions.

---

# Required Database Tables

Create new schema file:

```txt id="4"
server/db/address-schema.sql
```

---

# Table: user_addresses

```sql id="5"
CREATE TABLE user_addresses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,

  user_id BIGINT NOT NULL,

  full_name VARCHAR(120) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  alternate_phone VARCHAR(20),

  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),

  landmark VARCHAR(255),

  city VARCHAR(120) NOT NULL,
  state VARCHAR(120) NOT NULL,
  country VARCHAR(120) DEFAULT 'India',

  postal_code VARCHAR(20) NOT NULL,

  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),

  address_type ENUM('home', 'work', 'other') DEFAULT 'home',

  is_default BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_user_address
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
```

---

# Seed File

Create:

```txt id="6"
server/db/seed-address.sql
```

Add demo addresses.

---

# Backend APIs

Create APIs:

## GET /api/v1/addresses

Get all user addresses.

---

## POST /api/v1/addresses

Create new address.

---

## PATCH /api/v1/addresses/:id

Update address.

---

## DELETE /api/v1/addresses/:id

Delete address.

---

## PATCH /api/v1/addresses/:id/default

Set default address.

---

# Backend Structure

Create:

```txt id="7"
server/
 ├── routes/address.routes.ts
 ├── controllers/address.controller.ts
 ├── services/address.service.ts
 ├── validators/address.validator.ts
```

Reuse existing middleware and architecture.

---

# Frontend Components

Create reusable components:

```txt id="8"
components/address/AddressForm.tsx
components/address/AddressCard.tsx
components/address/LocationButton.tsx
components/address/AddressSelector.tsx
```

---

# Address Page UI Requirements

Design like premium grocery delivery apps.

Must include:

* clean card layouts
* floating labels
* mobile-first inputs
* sticky save button
* smooth transitions
* loading skeletons
* elegant spacing
* modern shadows
* rounded corners

---

# Saved Addresses

User should:

* view saved addresses
* select default address
* edit existing addresses
* delete addresses
* add multiple addresses

---

# Checkout Integration

Cart checkout should:

1. Require selected address
2. Show delivery ETA
3. Show selected delivery location
4. Persist selected address

---

# Security

* validate authenticated user
* users can access ONLY their addresses
* validate phone/pincode formats
* sanitize inputs

---

# UX Enhancements

Add:

* Google Maps preview placeholder support
* autofill animations
* inline validation
* toast notifications
* optimistic UI updates

---

# Important Behavior

If location permission denied:

* gracefully fallback to manual entry

If reverse geocoding fails:

* keep lat/lng
* allow manual completion

---

# Final UX Goal

Checkout should feel like a modern quick-commerce app:

* super fast
* frictionless
* location-aware
* mobile optimized
* premium UI quality
* easy one-handed usage
