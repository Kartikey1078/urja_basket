import { HttpError } from "../../../errors/httpError";
import * as productRepo from "../repositories/product.repository";

function mapProduct(row: productRepo.ProductListRow) {
  const price =
    row.card_price != null
      ? Number(row.card_price)
      : row.min_price != null
        ? Number(row.min_price)
        : 0;
  const rawMrp =
    row.card_original_price != null ? Number(row.card_original_price) : null;
  const mrp = rawMrp != null && rawMrp > price ? rawMrp : price;
  const weight = row.card_weight?.trim() ? row.card_weight : "—";

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    categoryId: row.category_id,
    category: {
      name: row.category_name,
      slug: row.category_slug,
    },
    mainImage: row.main_image,
    image: row.main_image,
    stock: row.stock,
    averageRating: Number(row.average_rating),
    totalReviews: row.total_reviews,
    isFeatured: Boolean(row.is_featured),
    isBestSeller: Boolean(row.is_best_seller),
    isOrganic: Boolean(row.is_organic),
    minPrice: row.min_price === null ? null : Number(row.min_price),
    price,
    mrp,
    weight,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapVariant(v: productRepo.ProductVariantRow) {
  return {
    id: v.id,
    productId: v.product_id,
    weight: v.weight,
    price: Number(v.price),
    originalPrice: v.original_price === null ? null : Number(v.original_price),
    discountPercentage: Number(v.discount_percentage),
    stock: v.stock,
    sku: v.sku,
    createdAt: v.created_at,
    updatedAt: v.updated_at,
  };
}

function mapReview(r: productRepo.ReviewRow) {
  return {
    id: r.id,
    userId: r.user_id,
    productId: r.product_id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  };
}

export async function listProductCards(filters?: productRepo.ProductCardFilters) {
  const rows = await productRepo.findAllProductCards(filters ?? {});
  return rows.map(mapProduct);
}

export async function getProductDetailBySlug(slug: string) {
  const product = await productRepo.findProductBySlug(slug);
  if (!product) {
    throw new HttpError(404, "Product not found");
  }
  const [variants, reviews] = await Promise.all([
    productRepo.findVariantsByProductId(product.id),
    productRepo.findReviewsByProductId(product.id),
  ]);
  return {
    product: mapProduct(product),
    variants: variants.map(mapVariant),
    reviews: reviews.map(mapReview),
  };
}
