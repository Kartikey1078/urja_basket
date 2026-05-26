import { CategoryProductListing } from "@/components/category-listing";
import { CATEGORY_DEMO_PRODUCTS } from "@/data/category-demo-products";

export default function BestsellersPage() {
  return (
    <div className="text-urja-forest">
      <h1 className="sr-only">Bestsellers</h1>
      <CategoryProductListing
        categoryLabel="Bestsellers"
        bestSellerOnly
        products={CATEGORY_DEMO_PRODUCTS}
      />
    </div>
  );
}
