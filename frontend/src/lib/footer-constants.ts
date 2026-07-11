/**
 * Edit these values for your live shop, social profiles, and contact details.
 * WhatsApp: country code + number, digits only (no + or spaces), e.g. India 9198xxxxxxx.
 */
export const FOOTER = {
  brand: "Urja Basket",
  tagline: "Fresh fruits & premium dry fruits — handpicked, hygienically packed, delivered with care.",
  whatsappDigits: "918750024024",
  phoneDisplay: "+91 87500 24024",
  email: "urjabasket9@gmail.com",
  storeHours: "Mon – Sun · 8:00 AM – 10:00 PM",
  instagramUrl: "https://www.instagram.com/urjabasket",
  facebookUrl: "https://www.facebook.com/urjabasket",
  addressLines: [
    "Urja Basket",
    "D-134, South Ganesh Nagar",
    "Delhi — 110092",
  ],
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=D+134+South+Ganesh+Nagar+Delhi+110092",
} as const;

export const FOOTER_SHOP_LINKS = [
  { href: "/categories/fresh-fruits", label: "Fresh Fruits" },
  { href: "/categories/dry-fruits", label: "Dry Fruits" },
  { href: "/categories/nuts-seeds", label: "Nuts & Seeds" },
  { href: "/bestsellers", label: "Bestsellers" },
  { href: "/categories", label: "All Categories" },
] as const;

export const FOOTER_HELP_LINKS = [
  { href: "/orders", label: "My Orders" },
  { href: "/cart", label: "Cart" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/login", label: "Sign In" },
] as const;

export const FOOTER_TRUST_POINTS = [
  { title: "100% Natural", subtitle: "No artificial flavours" },
  { title: "Premium Quality", subtitle: "Handpicked produce" },
  { title: "Fast Delivery", subtitle: "At your doorstep" },
  { title: "Secure Packaging", subtitle: "Hygienic & safe" },
] as const;
