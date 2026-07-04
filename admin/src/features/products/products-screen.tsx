"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";

import { NutritionTagsEditor } from "@/components/nutrition-tags-editor";
import { PageHeader } from "@/components/page-header";
import { AdminInlineLoader, AdminPageLoader, AdminTableLoader } from "@/components/loader";
import { StockStatusBadge } from "@/components/stock-status-badge";
import { adminFetchJson } from "@/lib/api-client";
import { adminToast, formatAdminError } from "@/lib/admin-toast";
import { cn } from "@/lib/cn";
import type { Category, PaginatedMeta, ProductListRow, StockStatus } from "@/lib/types";

const inputClass =
  "mt-1 block w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25";
const btnPrimary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";
const btnSecondary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50";

type ProductSort = "newest" | "name_asc" | "name_desc" | "stock_asc" | "stock_desc" | "updated";

function stockStatusFromCount(stock: number, lowThreshold = 10): StockStatus {
  if (stock <= 0) return "out_of_stock";
  if (stock <= lowThreshold) return "low_stock";
  return "in_stock";
}

function buildProductsQuery(params: {
  q: string;
  categoryId: string;
  stockStatus: string;
  sort: string;
  page: string;
  limit: string;
}) {
  const sp = new URLSearchParams();
  if (params.q.trim()) sp.set("q", params.q.trim());
  if (params.categoryId) sp.set("categoryId", params.categoryId);
  if (params.stockStatus) sp.set("stockStatus", params.stockStatus);
  if (params.sort && params.sort !== "newest") sp.set("sort", params.sort);
  if (params.page && params.page !== "1") sp.set("page", params.page);
  if (params.limit && params.limit !== "20") sp.set("limit", params.limit);
  const s = sp.toString();
  return s ? `products?${s}` : "products";
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function ProductsScreen() {
  return (
    <Suspense fallback={<AdminPageLoader label="Loading products…" />}>
      <ProductsInner />
    </Suspense>
  );
}

function ProductsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [createNutritionTags, setCreateNutritionTags] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");

  const q = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const stockStatus = searchParams.get("stockStatus") ?? "";
  const sort = (searchParams.get("sort") ?? "newest") as ProductSort;
  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "20";

  const apiPath = buildProductsQuery({ q, categoryId, stockStatus, sort, page, limit });

  const products = useQuery({
    queryKey: ["admin", "products", q, categoryId, stockStatus, sort, page, limit],
    queryFn: () =>
      adminFetchJson<{ data: ProductListRow[]; meta: PaginatedMeta }>(apiPath).then((r) => ({
        items: r.data,
        meta: r.meta,
      })),
  });

  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminFetchJson<{ data: Category[] }>("categories").then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      adminFetchJson<{ data: { id: number } }>("products", { method: "POST", json: body }),
    onSuccess: (res) => {
      adminToast.created("Product");
      setShowCreate(false);
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
      router.push(`/products/${res.data.id}`);
    },
    onError: (e) => adminToast.fromError(e),
  });

  const applyFilters = useCallback(
    (overrides?: Partial<{ q: string; categoryId: string; stockStatus: string; sort: string; page: string; limit: string }>) => {
      const next = {
        q: overrides?.q ?? searchInput,
        categoryId: overrides?.categoryId ?? categoryId,
        stockStatus: overrides?.stockStatus ?? stockStatus,
        sort: overrides?.sort ?? sort,
        page: overrides?.page ?? "1",
        limit: overrides?.limit ?? limit,
      };
      const path = buildProductsQuery(next);
      const qs = path.includes("?") ? path.split("?")[1] : "";
      router.push(qs ? `/products?${qs}` : "/products");
    },
    [router, searchInput, categoryId, stockStatus, sort, limit]
  );

  const clearFilters = () => {
    setSearchInput("");
    router.push("/products");
  };

  const meta = products.data?.meta;
  const items = products.data?.items ?? [];
  const pageNum = meta?.page ?? 1;
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;
  const limitNum = meta?.limit ?? Number(limit);
  const rangeStart = total === 0 ? 0 : (pageNum - 1) * limitNum + 1;
  const rangeEnd = Math.min(pageNum * limitNum, total);

  const hasActiveFilters = Boolean(q || categoryId || stockStatus || sort !== "newest");

  return (
    <div>
      <PageHeader
        title="Products"
        description="Browse, search, and manage your catalog. Open a product to edit details and variants."
        actions={
          <button type="button" className={btnPrimary} onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? (
              <>
                <X className="size-4" aria-hidden />
                Close
              </>
            ) : (
              <>
                <Plus className="size-4" aria-hidden />
                New product
              </>
            )}
          </button>
        }
      />

      {showCreate ? (
        <section className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">Create product</h2>
          <p className="mt-1 text-xs text-slate-600">You will be taken to the edit page after creation.</p>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const category_id = Number(fd.get("category_id"));
              create.mutate({
                name: String(fd.get("name") ?? "").trim(),
                slug: String(fd.get("slug") ?? "").trim(),
                category_id,
                short_description: String(fd.get("short_description") ?? "").trim() || null,
                main_image: String(fd.get("main_image") ?? "").trim() || null,
                stock: Number(fd.get("stock") ?? 0),
                is_featured: fd.get("is_featured") === "on",
                is_best_seller: fd.get("is_best_seller") === "on",
                is_organic: fd.get("is_organic") === "on",
                nutrition_tags: createNutritionTags,
              });
            }}
          >
            <label className="block text-sm font-medium text-slate-700">
              Name
              <input className={inputClass} name="name" required placeholder="Alphonso Mango" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Slug
              <input className={inputClass} name="slug" required placeholder="alphonso-mango" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Category
              <select className={inputClass} name="category_id" required defaultValue="">
                <option value="" disabled>
                  Select category…
                </option>
                {categories.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Stock
              <input className={inputClass} name="stock" type="number" min={0} defaultValue={0} />
            </label>
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Short description
              <input className={inputClass} name="short_description" placeholder="Optional" />
            </label>
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Image URL
              <input className={inputClass} name="main_image" placeholder="https://…" />
            </label>
            <div className="flex flex-wrap gap-4 text-sm text-slate-700 sm:col-span-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="is_featured" className="size-4 rounded border-slate-300" />
                Featured
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="is_best_seller" className="size-4 rounded border-slate-300" />
                Best seller
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="is_organic" className="size-4 rounded border-slate-300" />
                Organic
              </label>
            </div>
            <NutritionTagsEditor
              className="sm:col-span-2"
              value={createNutritionTags}
              onChange={setCreateNutritionTags}
            />
            <div className="sm:col-span-2">
              <button type="submit" className={btnPrimary} disabled={create.isPending || categories.isPending}>
                {create.isPending ? "Creating…" : "Create & open editor"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {/* Filters */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <SlidersHorizontal className="size-4 text-emerald-700" aria-hidden />
          Find products
        </div>
        <form
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters();
          }}
        >
          <label className="block text-sm font-medium text-slate-700 lg:col-span-2">
            Search
            <div className="relative mt-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                className={cn(inputClass, "mt-0 pl-9")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Name, slug, or category…"
              />
            </div>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Category
            <select
              className={inputClass}
              value={categoryId}
              onChange={(e) => applyFilters({ categoryId: e.target.value, page: "1" })}
            >
              <option value="">All categories</option>
              {categories.data?.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Stock
            <select
              className={inputClass}
              value={stockStatus}
              onChange={(e) => applyFilters({ stockStatus: e.target.value, page: "1" })}
            >
              <option value="">Any stock</option>
              <option value="in_stock">In stock</option>
              <option value="low_stock">Low stock</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Sort by
            <select
              className={inputClass}
              value={sort}
              onChange={(e) => applyFilters({ sort: e.target.value, page: "1" })}
            >
              <option value="newest">Newest first</option>
              <option value="name_asc">Name A–Z</option>
              <option value="name_desc">Name Z–A</option>
              <option value="stock_asc">Stock low → high</option>
              <option value="stock_desc">Stock high → low</option>
              <option value="updated">Recently updated</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Per page
            <select
              className={inputClass}
              value={limit}
              onChange={(e) => applyFilters({ limit: e.target.value, page: "1" })}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </label>
          <div className="flex flex-wrap gap-2 lg:col-span-6">
            <button type="submit" className={btnPrimary}>
              Apply
            </button>
            {hasActiveFilters ? (
              <button type="button" className={btnSecondary} onClick={clearFilters}>
                Clear filters
              </button>
            ) : null}
          </div>
        </form>
      </div>

      {/* Results bar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
        <p>
          {products.isLoading ? (
            <AdminInlineLoader label="Loading products…" />
          ) : total === 0 ? (
            "No products match your filters"
          ) : (
            <>
              Showing <span className="font-semibold text-slate-900">{rangeStart}–{rangeEnd}</span> of{" "}
              <span className="font-semibold text-slate-900">{total}</span> products
            </>
          )}
        </p>
        {total > 0 ? (
          <p className="text-xs text-slate-500">
            Page {pageNum} of {totalPages}
          </p>
        ) : null}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3 w-16">Image</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.isPending ? (
                <AdminTableLoader colSpan={8} label="Loading products…" />
              ) : products.error ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-red-700">
                    {formatAdminError(products.error)}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <Package className="mx-auto size-10 text-slate-300" strokeWidth={1.25} />
                    <p className="mt-3 font-medium text-slate-900">No products found</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {hasActiveFilters ? "Try clearing filters or a different search." : "Create your first product."}
                    </p>
                    {hasActiveFilters ? (
                      <button type="button" className={cn(btnSecondary, "mt-4")} onClick={clearFilters}>
                        Clear filters
                      </button>
                    ) : (
                      <button type="button" className={cn(btnPrimary, "mt-4")} onClick={() => setShowCreate(true)}>
                        <Plus className="size-4" />
                        New product
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <ProductRow key={p.id} product={p} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-3">
            <button
              type="button"
              className={btnSecondary}
              disabled={pageNum <= 1 || products.isFetching}
              onClick={() => applyFilters({ page: String(pageNum - 1) })}
            >
              <ChevronLeft className="size-4" aria-hidden />
              Previous
            </button>
            <div className="flex flex-wrap items-center justify-center gap-1">
              {paginationWindow(pageNum, totalPages).map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-slate-400">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={cn(
                      "min-h-9 min-w-9 rounded-lg text-sm font-medium transition",
                      p === pageNum
                        ? "bg-emerald-700 text-white"
                        : "text-slate-700 hover:bg-white"
                    )}
                    disabled={products.isFetching}
                    onClick={() => applyFilters({ page: String(p) })}
                  >
                    {p}
                  </button>
                )
              )}
            </div>
            <button
              type="button"
              className={btnSecondary}
              disabled={pageNum >= totalPages || products.isFetching}
              onClick={() => applyFilters({ page: String(pageNum + 1) })}
            >
              Next
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ProductRow({ product: p }: { product: ProductListRow }) {
  const status = stockStatusFromCount(p.stock);

  return (
    <tr className="group hover:bg-slate-50/80">
      <td className="px-4 py-3">
        <div className="relative size-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          {p.main_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.main_image}
              alt=""
              className="size-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-slate-400">
              <ImageIcon className="size-5" aria-hidden />
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <Link
          href={`/products/${p.id}`}
          className="font-semibold text-slate-900 hover:text-emerald-800 hover:underline"
        >
          {p.name}
        </Link>
        <p className="mt-0.5 font-mono text-xs text-slate-500">{p.slug}</p>
        <p className="text-xs text-slate-400">ID {p.id}</p>
      </td>
      <td className="px-4 py-3">
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          {p.category_name}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className="tabular-nums font-semibold text-slate-900">{p.stock}</span>
          <StockStatusBadge status={status} />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-slate-700">
          <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
          <span className="tabular-nums font-medium">{Number(p.average_rating).toFixed(1)}</span>
          <span className="text-xs text-slate-500">({p.total_reviews})</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {p.is_featured ? <TagChip label="Featured" tone="violet" /> : null}
          {p.is_best_seller ? <TagChip label="Bestseller" tone="amber" /> : null}
          {p.is_organic ? <TagChip label="Organic" tone="emerald" /> : null}
          {!p.is_featured && !p.is_best_seller && !p.is_organic ? (
            <span className="text-xs text-slate-400">—</span>
          ) : null}
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{formatDate(p.updated_at)}</td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/products/${p.id}`}
          className="inline-flex min-h-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
        >
          Edit
        </Link>
      </td>
    </tr>
  );
}

function TagChip({
  label,
  tone,
}: {
  label: string;
  tone: "violet" | "amber" | "emerald";
}) {
  const tones = {
    violet: "bg-violet-50 text-violet-800 border-violet-200",
    amber: "bg-amber-50 text-amber-900 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };
  return (
    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase", tones[tone])}>
      {label}
    </span>
  );
}

function paginationWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}
