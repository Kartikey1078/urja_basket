import type { CartItem } from "./types";

export const CART_STORAGE_KEY = "urja-cart-v1";

export const FREE_DELIVERY_MIN = 499;
export const DELIVERY_FEE = 40;
export const PACKAGING_CHARGES = 10;
export const CART_PROMO_DISCOUNT = 50;

/** Demo seed aligned with cart reference UI */
export const DEMO_CART_ITEMS: CartItem[] = [
  {
    id: "alphonso-mango",
    slug: "alphonso-mango",
    name: "Alphonso Mango",
    subtitle: "1 Box (4 pcs)",
    tag: "Premium Quality",
    price: 280,
    mrp: 320,
    image:
      "https://images.unsplash.com/photo-1553279768-865497681334?auto=format&w=200&h=200&fit=crop&q=80",
    quantity: 1,
  },
  {
    id: "premium-bananas",
    slug: "premium-bananas",
    name: "Premium Bananas",
    subtitle: "1 Bunch (8-10 pcs)",
    tag: "Farm Fresh",
    price: 60,
    mrp: 70,
    image:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&w=200&h=200&fit=crop&q=80",
    quantity: 1,
  },
  {
    id: "california-almonds",
    slug: "california-almonds",
    name: "California Almonds",
    subtitle: "250g",
    tag: "Rich in Protein",
    price: 320,
    mrp: 375,
    image:
      "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&w=200&h=200&fit=crop&q=80",
    quantity: 1,
  },
];
