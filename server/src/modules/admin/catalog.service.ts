import { HttpError } from "../../errors/httpError";
import { parseWeightSortValue } from "../../lib/variant-weight";
import * as categoryRepo from "../categories/repositories/category.repository";
import * as productRepo from "../products/repositories/product.repository";

const ALLOWED_CATALOG_SLUGS = new Set(["fresh-fruits", "dry-fruits"]);

export type CatalogProductItem = {
  id: number;
  name: string;
  image: string | null;
  weight: string;
  price: number;
};

export type CatalogPayload = {
  categorySlug: string;
  categoryName: string;
  generatedAt: string;
  products: CatalogProductItem[];
};

function pickLargestInStockVariant(
  variants: productRepo.ProductVariantRow[]
): productRepo.ProductVariantRow | null {
  const inStock = variants.filter((v) => Number(v.stock) > 0);
  if (inStock.length === 0) return null;

  return [...inStock].sort(
    (a, b) => parseWeightSortValue(b.weight) - parseWeightSortValue(a.weight)
  )[0];
}

export async function getCatalogByCategorySlug(categorySlug: string): Promise<CatalogPayload> {
  const slug = categorySlug.trim();
  if (!ALLOWED_CATALOG_SLUGS.has(slug)) {
    throw new HttpError(400, "Catalog category must be fresh-fruits or dry-fruits");
  }

  const category = await categoryRepo.findCategoryBySlug(slug);
  if (!category) {
    throw new HttpError(404, "Category not found");
  }

  const rows = await productRepo.findAllProductCards({
    categorySlug: slug,
    inStock: true,
  });

  const products: CatalogProductItem[] = [];

  for (const row of rows) {
    if (!row.is_active) continue;

    const variants = await productRepo.findVariantsByProductId(row.id);
    const chosen = pickLargestInStockVariant(variants);
    if (!chosen) continue;

    products.push({
      id: row.id,
      name: row.name,
      image: row.main_image,
      weight: chosen.weight.trim(),
      price: Number(chosen.price),
    });
  }

  products.sort((a, b) => a.name.localeCompare(b.name, "en"));

  return {
    categorySlug: slug,
    categoryName: category.name,
    generatedAt: new Date().toISOString(),
    products,
  };
}
