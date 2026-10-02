"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gift, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { AdminPageLoader, AdminTableLoader } from "@/components/loader";
import { StockStatusBadge } from "@/components/stock-status-badge";
import { adminFetchJson } from "@/lib/api-client";
import { adminToast } from "@/lib/admin-toast";
import { findGiftHamperCategoryId } from "@/lib/gift-hampers";
import type { Category, PaginatedMeta, ProductListRow } from "@/lib/types";

const inputClass =
  "mt-1 block w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25";
const btnPrimary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";
const btnGhost =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50";
const btnDanger =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50";

function stockStatusFromCount(stock: number, lowThreshold = 10) {
  if (stock <= 0) return "out_of_stock" as const;
  if (stock <= lowThreshold) return "low_stock" as const;
  return "in_stock" as const;
}

const STOREFRONT_BASE =
  process.env.NEXT_PUBLIC_STOREFRONT_URL?.replace(/\/+$/, "") ?? "http://localhost:3000";

export function GiftHampersScreen() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminFetchJson<{ data: Category[] }>("categories").then((r) => r.data),
  });

  const giftHamperCategoryId = useMemo(
    () => findGiftHamperCategoryId(categories.data),
    [categories.data]
  );

  const products = useQuery({
    queryKey: ["admin", "gift-hampers", giftHamperCategoryId],
    queryFn: () =>
      adminFetchJson<{ data: ProductListRow[]; meta: PaginatedMeta }>(
        `products?categoryId=${giftHamperCategoryId}&limit=100&sort=newest`
      ).then((r) => r.data),
    enabled: giftHamperCategoryId != null,
  });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      adminFetchJson<{ data: { id: number } }>("products", { method: "POST", json: body }),
    onSuccess: (res) => {
      adminToast.created("Gift hamper");
      setShowCreate(false);
      void qc.invalidateQueries({ queryKey: ["admin", "gift-hampers"] });
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
      window.location.href = `/products/${res.data.id}`;
    },
    onError: (e) => adminToast.fromError(e),
  });

  const archive = useMutation({
    mutationFn: (id: number) =>
      adminFetchJson<{ data: { message?: string } }>(`products/${id}`, { method: "DELETE" }),
    onSuccess: (res) => {
      adminToast.success(res.data.message ?? "Gift hamper archived");
      void qc.invalidateQueries({ queryKey: ["admin", "gift-hampers"] });
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  if (categories.isPending) {
    return (
      <div>
        <PageHeader title="Gift hampers" />
        <AdminPageLoader label="Loading…" />
      </div>
    );
  }

  if (giftHamperCategoryId == null) {
    return (
      <div>
        <PageHeader
          title="Gift hampers"
          description="The Gift Hamper category is missing from the catalog."
        />
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Run the database migration{" "}
          <code className="rounded bg-white px-1">021_gift_hamper_category.sql</code> on the API
          server, or create a category with slug{" "}
          <code className="rounded bg-white px-1">gift-hampers</code> under Categories.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Gift hampers"
        description="Add, edit, and remove gift hamper products shown on the storefront Gift Hamper page."
        actions={
          <button type="button" className={btnPrimary} onClick={() => setShowCreate((v) => !v)}>
            <Plus className="size-4" aria-hidden />
            {showCreate ? "Close form" : "New gift hamper"}
          </button>
        }
      />

      <p className="mb-6 text-sm text-slate-600">
        Storefront:{" "}
        <a
          href={`${STOREFRONT_BASE}/categories/gift-hampers`}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-emerald-800 hover:underline"
        >
          {STOREFRONT_BASE}/categories/gift-hampers
        </a>
        {" "}
        (open your shop URL in a new tab). After creating a hamper, add weight variants & pricing on
        the product editor.
      </p>

      {showCreate ? (
        <section className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Gift className="size-4 text-emerald-700" aria-hidden />
            New gift hamper
          </h2>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              create.mutate({
                name: String(fd.get("name") ?? "").trim(),
                slug: String(fd.get("slug") ?? "").trim(),
                category_id: giftHamperCategoryId,
                short_description: String(fd.get("short_description") ?? "").trim() || null,
                full_description: String(fd.get("full_description") ?? "").trim() || null,
                main_image: String(fd.get("main_image") ?? "").trim() || null,
                stock: Number(fd.get("stock") ?? 0),
                is_featured: fd.get("is_featured") === "on",
                is_best_seller: fd.get("is_best_seller") === "on",
                nutrition_tags: [],
              });
            }}
          >
            <label className="block text-sm font-medium text-slate-700">
              Name
              <input className={inputClass} name="name" required placeholder="Festive Delight Hamper" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Slug
              <input className={inputClass} name="slug" required placeholder="festive-delight-hamper" />
            </label>
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Short description
              <input className={inputClass} name="short_description" placeholder="Shown on listing cards" />
            </label>
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Full description
              <textarea className={`${inputClass} min-h-[5rem]`} name="full_description" rows={3} />
            </label>
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Image URL
              <input className={inputClass} name="main_image" placeholder="/home/gifthampers.png or https://…" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Stock (product-level)
              <input className={inputClass} name="stock" type="number" min={0} defaultValue={0} />
            </label>
            <div className="flex flex-wrap items-end gap-4 text-sm text-slate-700">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="is_featured" className="size-4 rounded border-slate-300" />
                Featured
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="is_best_seller" className="size-4 rounded border-slate-300" />
                Best seller
              </label>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className={btnPrimary} disabled={create.isPending}>
                {create.isPending ? "Creating…" : "Create & add variants"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {products.isPending ? (
          <AdminTableLoader />
        ) : products.isError ? (
          <p className="p-4 text-sm text-red-700">{(products.error as Error).message}</p>
        ) : (
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.data && products.data.length > 0 ? (
                products.data.map((row) => {
                  const archived = Number(row.is_active) !== 1;
                  return (
                    <tr key={row.id} className={archived ? "bg-slate-50/80 text-slate-500" : undefined}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{row.name}</p>
                        <p className="text-xs text-slate-500">{row.slug}</p>
                        {archived ? (
                          <span className="mt-1 inline-block text-xs font-semibold text-amber-800">
                            Archived
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{row.stock}</td>
                      <td className="px-4 py-3">
                        <StockStatusBadge status={stockStatusFromCount(row.stock)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link href={`/products/${row.id}`} className={btnGhost}>
                            <Pencil className="size-4" aria-hidden />
                            Edit
                          </Link>
                          {!archived ? (
                            <button
                              type="button"
                              className={btnDanger}
                              disabled={archive.isPending}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Archive "${row.name}"? It will be hidden from the shop.`
                                  )
                                ) {
                                  archive.mutate(row.id);
                                }
                              }}
                            >
                              <Trash2 className="size-4" aria-hidden />
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                    No gift hampers yet. Create one to show on the storefront.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
