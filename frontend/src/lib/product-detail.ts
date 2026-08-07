import { getApiBaseUrl } from "./api";

export type ProductVariant = {
  id: number;
  productId: number;
  weight: string;
  price: number;
  originalPrice: number | null;
  discountPercentage: number;
  stock: number;
  sku: string;
  inStock: boolean;
};

export type ProductDetail = {
  id: number;
  slug: string;
  name: string;
  shortDescription: string | null;
  fullDescription: string | null;
  mainImage: string | null;
  image: string | null;
  isActive: boolean;
  inStock: boolean;
  averageRating: number;
  totalReviews: number;
  isBestSeller: boolean;
  isOrganic: boolean;
  nutritionTags?: string[];
  category: { name: string; slug: string };
};

export type ProductDetailResponse = {
  product: ProductDetail;
  variants: ProductVariant[];
  reviews: Array<{
    id: number;
    rating: number;
    comment: string | null;
    createdAt: string;
  }>;
};

export async function fetchProductDetail(slug: string): Promise<ProductDetailResponse | null> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/v1/products/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: ProductDetailResponse };
    return body.data ?? null;
  } catch {
    return null;
  }
}
