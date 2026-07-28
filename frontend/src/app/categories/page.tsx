import { JsonLd } from "@/components/seo/json-ld";
import { CategoriesGrid } from "@/components/categories/categories-grid";
import { breadcrumbJsonLd, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Shop by Category",
  description:
    "Browse fresh fruits, dry fruits, nuts & seeds at Urja Basket. Order online with free delivery in Delhi.",
  path: "/categories",
  keywords: [
    "fruit categories",
    "dry fruits categories",
    "shop fruits online Delhi",
    "Urja Basket categories",
  ],
});

export default function CategoriesPage() {
  return (
    <div className="bg-background min-w-0 px-4 py-8 sm:px-6 lg:mx-auto lg:max-w-7xl lg:px-10 lg:py-12">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Categories", path: "/categories" },
        ])}
      />

      <header className="max-w-2xl">
        <p className="text-urja-forest/60 text-xs font-semibold uppercase tracking-[0.14em]">
          Browse
        </p>
        <h1
          className="text-urja-forest mt-1 text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ fontFamily: "var(--font-urja-serif), ui-serif, Georgia, serif" }}
        >
          Shop by category
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Fresh fruits, premium dry fruits, and nuts — pick a category to explore products.
        </p>
      </header>

      <CategoriesGrid />
    </div>
  );
}
