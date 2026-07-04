"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { NutritionTagsEditor } from "@/components/nutrition-tags-editor";
import { PageHeader } from "@/components/page-header";
import { AdminPageLoader } from "@/components/loader";
import { adminFetchJson } from "@/lib/api-client";
import { adminToast } from "@/lib/admin-toast";
import type { Category, ProductDetail, ProductVariant } from "@/lib/types";

const inputClass =
  "mt-1 block w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25";
const btnPrimary =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";
const btnGhost =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50";
const btnDanger =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-800 hover:bg-red-100";

function bit(v: number): boolean {
  return Number(v) === 1;
}

export function ProductDetailScreen() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const qc = useQueryClient();
  const [nutritionTags, setNutritionTags] = useState<string[]>([]);

  const product = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: () => adminFetchJson<{ data: ProductDetail }>(`products/${id}`).then((r) => r.data),
    enabled: Number.isInteger(id) && id > 0,
  });

  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminFetchJson<{ data: Category[] }>("categories").then((r) => r.data),
  });

  const variants = useQuery({
    queryKey: ["admin", "variants", id],
    queryFn: () => adminFetchJson<{ data: ProductVariant[] }>(`products/${id}/variants`).then((r) => r.data),
    enabled: Number.isInteger(id) && id > 0,
  });

  const updateProduct = useMutation({
    mutationFn: (body: Record<string, unknown>) => adminFetchJson(`products/${id}`, { method: "PATCH", json: body }),
    onSuccess: () => {
      adminToast.saved("Product");
      void qc.invalidateQueries({ queryKey: ["admin", "product", id] });
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  const deleteProduct = useMutation({
    mutationFn: () => adminFetchJson(`products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      adminToast.deleted("Product");
      void qc.invalidateQueries({ queryKey: ["admin", "products"] });
      router.push("/products");
    },
    onError: (e) => adminToast.fromError(e),
  });

  const createVariant = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      adminFetchJson<{ data: { id: number } }>(`products/${id}/variants`, { method: "POST", json: body }),
    onSuccess: () => {
      adminToast.created("Variant");
      void qc.invalidateQueries({ queryKey: ["admin", "variants", id] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  useEffect(() => {
    if (product.data) {
      setNutritionTags(product.data.nutrition_tags ?? []);
    }
  }, [product.data]);

  if (!Number.isInteger(id) || id <= 0) {
    return <p className="text-sm text-red-700">Invalid product id.</p>;
  }

  if (product.isError) {
    return (
      <div>
        <PageHeader title="Product" />
        <p className="text-sm text-red-700">{(product.error as Error).message}</p>
        <Link href="/products" className="mt-4 inline-block text-sm font-medium text-emerald-800 hover:underline">
          ← Back to products
        </Link>
      </div>
    );
  }

  if (product.isPending || !product.data) {
    return (
      <div>
        <PageHeader title="Product" />
        <AdminPageLoader />
      </div>
    );
  }

  const p = product.data;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title={p.name} description={`Slug: ${p.slug}`} className="mb-0 min-w-0 flex-1" />
        <Link
          href="/products"
          className="shrink-0 text-sm font-medium text-emerald-800 hover:underline sm:pt-1"
        >
          ← All products
        </Link>
      </div>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">Product details</h2>
        <form
          className="mt-4 grid gap-4 lg:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            updateProduct.mutate({
              name: String(fd.get("name") ?? "").trim(),
              slug: String(fd.get("slug") ?? "").trim(),
              category_id: Number(fd.get("category_id")),
              short_description: String(fd.get("short_description") ?? "").trim() || null,
              full_description: String(fd.get("full_description") ?? "").trim() || null,
              main_image: String(fd.get("main_image") ?? "").trim() || null,
              stock: Number(fd.get("stock") ?? 0),
              is_featured: fd.get("is_featured") === "on",
              is_best_seller: fd.get("is_best_seller") === "on",
              is_organic: fd.get("is_organic") === "on",
              nutrition_tags: nutritionTags,
            });
          }}
        >
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input className={inputClass} name="name" required defaultValue={p.name} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Slug
            <input className={inputClass} name="slug" required defaultValue={p.slug} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Category
            <select className={inputClass} name="category_id" required defaultValue={p.category_id}>
              {categories.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Stock
            <input className={inputClass} name="stock" type="number" defaultValue={p.stock} />
          </label>
          <label className="block text-sm font-medium text-slate-700 lg:col-span-2">
            Short description
            <input className={inputClass} name="short_description" defaultValue={p.short_description ?? ""} />
          </label>
          <label className="block text-sm font-medium text-slate-700 lg:col-span-2">
            Full description
            <textarea
              className={`${inputClass} min-h-[6rem]`}
              name="full_description"
              rows={4}
              defaultValue={p.full_description ?? ""}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 lg:col-span-2">
            Main image URL
            <input className={inputClass} name="main_image" defaultValue={p.main_image ?? ""} />
          </label>
          <div className="flex flex-wrap gap-4 text-sm text-slate-700 lg:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={bit(p.is_featured)}
                className="size-4 rounded border-slate-300"
              />
              Featured
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_best_seller"
                defaultChecked={bit(p.is_best_seller)}
                className="size-4 rounded border-slate-300"
              />
              Best seller
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_organic"
                defaultChecked={bit(p.is_organic)}
                className="size-4 rounded border-slate-300"
              />
              Organic
            </label>
          </div>
          <NutritionTagsEditor
            className="lg:col-span-2"
            value={nutritionTags}
            onChange={setNutritionTags}
          />
          <div className="flex flex-col gap-2 sm:flex-row lg:col-span-2">
            <button type="submit" className={btnPrimary} disabled={updateProduct.isPending}>
              {updateProduct.isPending ? "Saving…" : "Save product"}
            </button>
            <button
              type="button"
              className={btnDanger}
              disabled={deleteProduct.isPending}
              onClick={() => {
                if (typeof window !== "undefined" && window.confirm("Delete this product and its variants?")) {
                  deleteProduct.mutate();
                }
              }}
            >
              Delete product
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">Variants</h2>
        <form
          className="mt-4 grid gap-3 border-b border-slate-100 pb-6 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const op = fd.get("original_price");
            createVariant.mutate({
              weight: String(fd.get("weight") ?? "").trim(),
              sku: String(fd.get("sku") ?? "").trim(),
              price: Number(fd.get("price")),
              original_price:
                op === null || String(op).trim() === "" ? null : Number(op),
              discount_percentage: fd.get("discount_percentage")
                ? Number(fd.get("discount_percentage"))
                : 0,
              stock: Number(fd.get("stock") ?? 0),
            });
            e.currentTarget.reset();
          }}
        >
          <label className="block text-xs font-medium text-slate-700 sm:col-span-1">
            Weight label
            <input className={inputClass} name="weight" required placeholder="500g" />
          </label>
          <label className="block text-xs font-medium text-slate-700 sm:col-span-1">
            SKU
            <input className={inputClass} name="sku" required />
          </label>
          <label className="block text-xs font-medium text-slate-700 sm:col-span-1">
            Price
            <input className={inputClass} name="price" type="number" step="0.01" required />
          </label>
          <label className="block text-xs font-medium text-slate-700 sm:col-span-1">
            Original price
            <input className={inputClass} name="original_price" type="number" step="0.01" />
          </label>
          <label className="block text-xs font-medium text-slate-700 sm:col-span-1">
            Discount %
            <input className={inputClass} name="discount_percentage" type="number" defaultValue={0} />
          </label>
          <label className="block text-xs font-medium text-slate-700 sm:col-span-1">
            Stock
            <input className={inputClass} name="stock" type="number" defaultValue={0} />
          </label>
          <div className="flex items-end sm:col-span-2 lg:col-span-2">
            <button type="submit" className={btnPrimary} disabled={createVariant.isPending}>
              Add variant
            </button>
          </div>
        </form>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-600">
              <tr>
                <th className="py-2 pr-3">SKU</th>
                <th className="py-2 pr-3">Weight</th>
                <th className="py-2 pr-3">Price</th>
                <th className="py-2 pr-3">Stock</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {variants.data?.map((v) => (
                <VariantRow key={v.id} v={v} productId={id} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function VariantRow({
  v,
  productId,
}: {
  v: ProductVariant;
  productId: number;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const update = useMutation({
    mutationFn: (body: Record<string, unknown>) => adminFetchJson(`variants/${v.id}`, { method: "PATCH", json: body }),
    onSuccess: () => {
      adminToast.updated("Variant");
      void qc.invalidateQueries({ queryKey: ["admin", "variants", productId] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  const remove = useMutation({
    mutationFn: () => adminFetchJson(`variants/${v.id}`, { method: "DELETE" }),
    onSuccess: () => {
      adminToast.deleted("Variant");
      void qc.invalidateQueries({ queryKey: ["admin", "variants", productId] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  return (
    <tr className="align-top">
      <td className="py-3 pr-3 font-mono text-xs">{v.sku}</td>
      <td className="py-3 pr-3">{v.weight}</td>
      <td className="py-3 pr-3 tabular-nums">{v.price}</td>
      <td className="py-3 pr-3 tabular-nums">{v.stock}</td>
      <td className="py-3">
        <button type="button" className={btnGhost} onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Edit"}
        </button>
        {open ? (
          <form
            className="mt-2 flex max-w-md flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const op = fd.get("original_price");
              update.mutate({
                weight: String(fd.get("weight") ?? "").trim(),
                sku: String(fd.get("sku") ?? "").trim(),
                price: Number(fd.get("price")),
                original_price:
                  op === null || String(op).trim() === "" ? null : Number(op),
                discount_percentage: Number(fd.get("discount_percentage") ?? 0),
                stock: Number(fd.get("stock") ?? 0),
              });
              setOpen(false);
            }}
          >
            <input className={inputClass} name="weight" defaultValue={v.weight} required />
            <input className={inputClass} name="sku" defaultValue={v.sku} required />
            <input className={inputClass} name="price" type="number" step="0.01" defaultValue={v.price} required />
            <input
              className={inputClass}
              name="original_price"
              type="number"
              step="0.01"
              defaultValue={v.original_price ?? ""}
            />
            <input
              className={inputClass}
              name="discount_percentage"
              type="number"
              defaultValue={v.discount_percentage}
            />
            <input className={inputClass} name="stock" type="number" defaultValue={v.stock} />
            <div className="flex flex-wrap gap-2">
              <button type="submit" className={btnPrimary} disabled={update.isPending}>
                Save
              </button>
              <button
                type="button"
                className={btnDanger}
                disabled={remove.isPending}
                onClick={() => {
                  if (typeof window !== "undefined" && window.confirm(`Delete variant ${v.sku}?`)) remove.mutate();
                }}
              >
                Delete
              </button>
            </div>
          </form>
        ) : null}
      </td>
    </tr>
  );
}
