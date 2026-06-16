import type { CategoryProduct } from "@/lib/category-product-types";
import type { ProductFilters } from "@/lib/category-filters";
import { appendFiltersToSearchParams } from "@/lib/category-filters";
import type { ProductSortValue } from "@/lib/category-sort";

import { getApiBaseUrl } from "./api";
import type { NutritionTagOption } from "./nutrition-filter-types";

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
  nutritionTags?: string[];
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
    nutritionTags: p.nutritionTags?.length ? p.nutritionTags : undefined,
  };
}

async function safeProductsFetch(url: string): Promise<CategoryProduct[]> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Products API failed: ${res.status}`);
    }
    const body = (await res.json()) as ProductsResponse;
    if (!Array.isArray(body.data)) return [];
    return body.data.map(mapApiProductToCategoryProduct);
  } catch (err) {
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      throw new Error("Could not reach the store API. Check that the backend is running.");
    }
    throw err;
  }
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
  return safeProductsFetch(url);
}

export async function fetchNutritionTags(categorySlug?: string): Promise<NutritionTagOption[]> {
  const base = getApiBaseUrl();
  const params = new URLSearchParams();
  if (categorySlug) params.set("categorySlug", categorySlug);
  const qs = params.toString();
  const url = `${base}/api/v1/products/nutrition-tags${qs ? `?${qs}` : ""}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const body = (await res.json()) as { data?: NutritionTagOption[] };
    if (!Array.isArray(body.data)) return [];
    return body.data.map((item) => ({
      name: item.name,
      slug: item.slug,
      imageUrl: item.imageUrl ?? null,
    }));
  } catch {
    return [];
  }
}

export async function fetchBestsellerProducts(): Promise<ApiProduct[]> {
  const base = getApiBaseUrl();
  const url = `${base}/api/v1/products?bestSeller=1`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const body = (await res.json()) as ProductsResponse;
    return Array.isArray(body.data) ? body.data : [];
  } catch {
    return [];
  }
}
