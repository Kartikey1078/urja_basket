import { CategoryPageSkeleton } from "@/components/category-listing/category-page-skeleton";

export default function BestsellersLoading() {
  return (
    <div className="text-urja-forest">
      <CategoryPageSkeleton productCount={8} />
    </div>
  );
}
