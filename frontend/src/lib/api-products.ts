import type { CategoryProduct } from "@/lib/category-product-types";
import type { ProductFilters } from "@/lib/category-filters";
import { appendFiltersToSearchParams } from "@/lib/category-filters";
import type { ProductSortValue } from "@/lib/category-sort";

import { getApiBaseUrl } from "./api";

export type ApiProduct = {
  id: number;
  slug: string;
  name: string;
  mainImage: string | null;
  image: string | null;
  shortDescription: string | null;
  averageRating: number;
  totalReviews: number;
  isBestSeller: boolean;
  price: number;
  mrp: number;
  weight: string;
  category: { name: string; slug: string };
};

type ProductsResponse = { data: ApiProduct[] };

const FALLBACK_IMAGE = "/image.png";

function mapApiProductToCategoryProduct(p: ApiProduct): CategoryProduct {
  const image = (p.image ?? p.mainImage ?? "").trim() || FALLBACK_IMAGE;
  return {
    slug: p.slug,
    name: p.name,
    weight: p.weight,
    price: p.price,
    mrp: p.mrp > 0 ? p.mrp : p.price,
    image,
    rating: p.averageRating,
    reviewCount: p.totalReviews,
    isBestseller: p.isBestSeller,
  };
}

export async function fetchProducts(options?: {
  categorySlug?: string;
  bestSellerOnly?: boolean;
  sort?: ProductSortValue;
  filters?: ProductFilters;
}): Promise<CategoryProduct[]> {
  const base = getApiBaseUrl();
  const params = new URLSearchParams();
  if (options?.categorySlug) params.set("categorySlug", options.categorySlug);
  if (options?.bestSellerOnly) params.set("bestSeller", "1");
  if (options?.sort) params.set("sort", options.sort);
  if (options?.filters) appendFiltersToSearchParams(params, options.filters);
  const qs = params.toString();
  const url = `${base}/api/v1/products${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Products API failed: ${res.status}`);
  }
  const body = (await res.json()) as ProductsResponse;
  if (!Array.isArray(body.data)) return [];
  return body.data.map(mapApiProductToCategoryProduct);
}

export async function fetchBestsellerProducts(): Promise<ApiProduct[]> {
  const base = getApiBaseUrl();
  const url = `${base}/api/v1/products?bestSeller=1`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const body = (await res.json()) as ProductsResponse;
  return Array.isArray(body.data) ? body.data : [];
}
