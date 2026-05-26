/** Minimal product snapshot stored in the local wishlist. */
export type WishlistItem = {
  slug: string;
  name: string;
  weight: string;
  price: number;
  mrp: number;
  image: string;
  rating: number;
  reviewCount: number;
  isBestseller?: boolean;
  savedAt: number;
};

export type WishlistProductInput = {
  slug: string;
  name: string;
  weight: string;
  price: number;
  mrp: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  isBestseller?: boolean;
};

export function toWishlistItem(product: WishlistProductInput): WishlistItem {
  return {
    slug: product.slug,
    name: product.name,
    weight: product.weight,
    price: product.price,
    mrp: product.mrp,
    image: product.image,
    rating: product.rating ?? 0,
    reviewCount: product.reviewCount ?? 0,
    isBestseller: product.isBestseller,
    savedAt: Date.now(),
  };
}
