"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { AdminApiError, adminFetchJson } from "@/lib/api-client";
import type { Category, ProductListRow } from "@/lib/types";

const inputClass =
  "mt-1 block w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25";
const btnPrimary =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";

function formatErr(e: unknown): string {
  if (e instanceof AdminApiError) return e.message;
  if (e instanceof Error) return e.message;
  return "Request failed";
}

export function ProductsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [banner, setBanner] = useState<string | null>(null);

  const products = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => adminFetchJson<{ data: ProductListRow[] }>("products").then((r) => r.data),
  });

  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminFetchJson<{ data: Category[] }>("categories").then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      adminFetchJson<{ data: { id: number } }>("products", { method: "POST", json: body }),
    onSuccess: (res) => {
      setBanner(null);
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
      router.push(`/products/${res.data.id}`);
    },
    onError: (e) => setBanner(formatErr(e)),
  });

  return (
    <div>
      <PageHeader title="Products" description="Manage catalog products. Open a row to edit variants and details." />
      {banner ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
          {banner}
        </div>
      ) : null}

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">New product</h2>
        <form
          className="mt-4 grid gap-4 lg:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const category_id = Number(fd.get("category_id"));
            create.mutate({
              name: String(fd.get("name") ?? "").trim(),
              slug: String(fd.get("slug") ?? "").trim(),
              category_id,
              short_description: String(fd.get("short_description") ?? "").trim() || null,
              full_description: String(fd.get("full_description") ?? "").trim() || null,
              main_image: String(fd.get("main_image") ?? "").trim() || null,
              stock: Number(fd.get("stock") ?? 0),
              is_featured: fd.get("is_featured") === "on",
              is_best_seller: fd.get("is_best_seller") === "on",
              is_organic: fd.get("is_organic") === "on",
            });
            e.currentTarget.reset();
          }}
        >
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input className={inputClass} name="name" required />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Slug
            <input className={inputClass} name="slug" required />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Category
            <select className={inputClass} name="category_id" required defaultValue="">
              <option value="" disabled>
                Select…
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
            <input className={inputClass} name="stock" type="number" defaultValue={0} />
          </label>
          <label className="block text-sm font-medium text-slate-700 lg:col-span-2">
            Short description
            <input className={inputClass} name="short_description" />
          </label>
          <label className="block text-sm font-medium text-slate-700 lg:col-span-2">
            Full description
            <textarea className={`${inputClass} min-h-[5rem]`} name="full_description" rows={3} />
          </label>
          <label className="block text-sm font-medium text-slate-700 lg:col-span-2">
            Main image URL
            <input className={inputClass} name="main_image" />
          </label>
          <div className="flex flex-wrap gap-4 text-sm text-slate-700 lg:col-span-2">
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
          <div className="lg:col-span-2">
            <button type="submit" className={btnPrimary} disabled={create.isPending || categories.isPending}>
              {create.isPending ? "Creating…" : "Create & open"}
            </button>
          </div>
        </form>
      </section>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-3 py-3 sm:px-4">ID</th>
              <th className="px-3 py-3 sm:px-4">Name</th>
              <th className="px-3 py-3 sm:px-4">Category</th>
              <th className="px-3 py-3 sm:px-4">Stock</th>
              <th className="px-3 py-3 sm:px-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.isPending ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : null}
            {products.error ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-red-700">
                  {(products.error as Error).message}
                </td>
              </tr>
            ) : null}
            {products.data?.map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-3 font-mono text-xs sm:px-4">{p.id}</td>
                <td className="px-3 py-3 font-medium text-slate-900 sm:px-4">{p.name}</td>
                <td className="px-3 py-3 text-slate-600 sm:px-4">{p.category_name}</td>
                <td className="px-3 py-3 tabular-nums sm:px-4">{p.stock}</td>
                <td className="px-3 py-3 sm:px-4">
                  <Link
                    href={`/products/${p.id}`}
                    className="font-medium text-emerald-800 underline-offset-2 hover:underline"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
