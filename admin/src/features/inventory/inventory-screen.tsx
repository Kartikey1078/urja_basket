"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { AdminInlineLoader, AdminPageLoader } from "@/components/loader";
import { StockStatusBadge } from "@/components/stock-status-badge";
import { AdminApiError, adminFetchJson } from "@/lib/api-client";
import type { Category, InventoryListRow, InventorySummary, InventoryVariantRow, StockStatus } from "@/lib/types";

const inputClass =
  "mt-1 block w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25";
const btnPrimary =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";
const btnGhost =
  "inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50";

function formatErr(e: unknown): string {
  if (e instanceof AdminApiError) return e.message;
  if (e instanceof Error) return e.message;
  return "Request failed";
}

function buildInventoryQuery(params: {
  q: string;
  categoryId: string;
  stockStatus: string;
  sort: string;
}) {
  const sp = new URLSearchParams();
  if (params.q.trim()) sp.set("q", params.q.trim());
  if (params.categoryId) sp.set("categoryId", params.categoryId);
  if (params.stockStatus) sp.set("stockStatus", params.stockStatus);
  if (params.sort) sp.set("sort", params.sort);
  const s = sp.toString();
  return s ? `inventory?${s}` : "inventory";
}

export function InventoryScreen() {
  return (
    <Suspense fallback={<AdminPageLoader label="Loading inventory…" />}>
      <InventoryInner />
    </Suspense>
  );
}

function InventoryInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const [banner, setBanner] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");

  const q = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const stockStatus = (searchParams.get("stockStatus") ?? "") as StockStatus | "";
  const sort = searchParams.get("sort") ?? "name";

  const apiPath = buildInventoryQuery({ q, categoryId, stockStatus, sort });

  const summary = useQuery({
    queryKey: ["admin", "inventory", "summary"],
    queryFn: () => adminFetchJson<{ data: InventorySummary }>("inventory/summary").then((r) => r.data),
  });

  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminFetchJson<{ data: Category[] }>("categories").then((r) => r.data),
  });

  const list = useQuery({
    queryKey: ["admin", "inventory", q, categoryId, stockStatus, sort],
    queryFn: () => adminFetchJson<{ data: InventoryListRow[] }>(apiPath).then((r) => r.data),
  });

  const variants = useQuery({
    queryKey: ["admin", "inventory", "variants", expandedId],
    queryFn: () =>
      adminFetchJson<{ data: InventoryVariantRow[] }>(`inventory/products/${expandedId}/variants`).then(
        (r) => r.data
      ),
    enabled: expandedId != null && expandedId > 0,
  });

  const updateProductStock = useMutation({
    mutationFn: (args: { id: number; stock: number }) =>
      adminFetchJson(`inventory/products/${args.id}/stock`, {
        method: "PATCH",
        json: { stock: args.stock },
      }),
    onSuccess: () => {
      setBanner(null);
      void qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
    },
    onError: (e) => setBanner(formatErr(e)),
  });

  const updateVariantStock = useMutation({
    mutationFn: (args: { id: number; stock: number }) =>
      adminFetchJson(`inventory/variants/${args.id}/stock`, {
        method: "PATCH",
        json: { stock: args.stock },
      }),
    onSuccess: () => {
      setBanner(null);
      void qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
      if (expandedId) {
        void qc.invalidateQueries({ queryKey: ["admin", "inventory", "variants", expandedId] });
      }
    },
    onError: (e) => setBanner(formatErr(e)),
  });

  const applyFilters = useCallback(
    (overrides?: Partial<{ q: string; categoryId: string; stockStatus: string; sort: string }>) => {
      const next = {
        q: overrides?.q ?? searchInput,
        categoryId: overrides?.categoryId ?? categoryId,
        stockStatus: overrides?.stockStatus ?? stockStatus,
        sort: overrides?.sort ?? sort,
      };
      const path = buildInventoryQuery(next);
      const qs = path.includes("?") ? path.split("?")[1] : "";
      router.push(qs ? `/inventory?${qs}` : "/inventory");
    },
    [router, searchInput, categoryId, stockStatus, sort]
  );

  const filterChip = (status: StockStatus | "", label: string, count?: number) => {
    const active = stockStatus === status;
    const href = status
      ? `/inventory?${new URLSearchParams({ ...(q && { q }), ...(categoryId && { categoryId }), stockStatus: status, sort }).toString()}`
      : `/inventory?${new URLSearchParams({ ...(q && { q }), ...(categoryId && { categoryId }), sort }).toString()}`;
    return (
      <Link
        href={href || "/inventory"}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
          active
            ? "border-emerald-700 bg-emerald-700 text-white"
            : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
        }`}
      >
        {label}
        {count != null ? <span className="tabular-nums opacity-80">({count})</span> : null}
      </Link>
    );
  };

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Search and filter stock, update quantities inline, and expand variants."
      />

      {banner ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
          {banner}
        </div>
      ) : null}

      {summary.data ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {filterChip("", "All", summary.data.total_products)}
          {filterChip("in_stock", "In stock", summary.data.in_stock)}
          {filterChip("low_stock", "Low stock", summary.data.low_stock)}
          {filterChip("out_of_stock", "Out of stock", summary.data.out_of_stock)}
        </div>
      ) : null}

      <form
        className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters();
        }}
      >
        <label className="block text-sm font-medium text-slate-700 lg:col-span-2">
          Search product
          <input
            className={inputClass}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Name or slug…"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Category
          <select
            className={inputClass}
            value={categoryId}
            onChange={(e) => applyFilters({ categoryId: e.target.value })}
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
          Stock level
          <select
            className={inputClass}
            value={stockStatus}
            onChange={(e) => applyFilters({ stockStatus: e.target.value })}
          >
            <option value="">Any</option>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock (≤10)</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Sort by
          <select
            className={inputClass}
            value={sort}
            onChange={(e) => applyFilters({ sort: e.target.value })}
          >
            <option value="name">Name A–Z</option>
            <option value="stock_asc">Stock low → high</option>
            <option value="stock_desc">Stock high → low</option>
            <option value="updated">Recently updated</option>
          </select>
        </label>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
          <button type="submit" className={btnPrimary}>
            Apply
          </button>
          <button
            type="button"
            className={btnGhost}
            onClick={() => {
              setSearchInput("");
              router.push("/inventory");
            }}
          >
            Reset
          </button>
        </div>
      </form>

      <p className="mb-3 text-sm text-slate-600">
        {list.isPending ? (
          <AdminInlineLoader label="Loading…" />
        ) : (
          `${list.data?.length ?? 0} product(s)`
        )}
        {stockStatus ? ` · filtered: ${stockStatus.replace(/_/g, " ")}` : ""}
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="w-10 px-3 py-3 sm:px-4" />
              <th className="px-3 py-3 sm:px-4">Product</th>
              <th className="px-3 py-3 sm:px-4">Category</th>
              <th className="px-3 py-3 sm:px-4">Status</th>
              <th className="px-3 py-3 sm:px-4">Effective stock</th>
              <th className="px-3 py-3 sm:px-4">Product stock</th>
              <th className="px-3 py-3 sm:px-4">Variants</th>
              <th className="px-3 py-3 sm:px-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.data?.map((row) => (
              <InventoryRow
                key={row.id}
                row={row}
                expanded={expandedId === row.id}
                onToggle={() => setExpandedId((id) => (id === row.id ? null : row.id))}
                variants={expandedId === row.id ? variants.data : undefined}
                variantsLoading={expandedId === row.id && variants.isPending}
                onSaveProductStock={(stock) => updateProductStock.mutate({ id: row.id, stock })}
                onSaveVariantStock={(variantId, stock) => updateVariantStock.mutate({ id: variantId, stock })}
                saving={updateProductStock.isPending || updateVariantStock.isPending}
              />
            ))}
            {!list.isPending && list.data?.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  No products match your filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InventoryRow({
  row,
  expanded,
  onToggle,
  variants,
  variantsLoading,
  onSaveProductStock,
  onSaveVariantStock,
  saving,
}: {
  row: InventoryListRow;
  expanded: boolean;
  onToggle: () => void;
  variants?: InventoryVariantRow[];
  variantsLoading?: boolean;
  onSaveProductStock: (stock: number) => void;
  onSaveVariantStock: (variantId: number, stock: number) => void;
  saving: boolean;
}) {
  const [productStock, setProductStock] = useState(String(row.product_stock));

  return (
    <>
      <tr className="hover:bg-slate-50/80">
        <td className="px-3 py-3 sm:px-4">
          {row.variant_count > 0 ? (
            <button
              type="button"
              onClick={onToggle}
              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
              aria-expanded={expanded}
            >
              {expanded ? "−" : "+"}
            </button>
          ) : null}
        </td>
        <td className="px-3 py-3 sm:px-4">
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.slug}</p>
        </td>
        <td className="px-3 py-3 sm:px-4 text-slate-600">{row.category_name}</td>
        <td className="px-3 py-3 sm:px-4">
          <StockStatusBadge status={row.stock_status} />
        </td>
        <td className="px-3 py-3 sm:px-4 font-semibold tabular-nums">{row.effective_stock}</td>
        <td className="px-3 py-3 sm:px-4">
          {row.variant_count === 0 ? (
            <StockEditor
              value={productStock}
              onChange={setProductStock}
              onSave={() => onSaveProductStock(Number(productStock))}
              disabled={saving}
            />
          ) : (
            <span className="text-slate-500 tabular-nums">{row.product_stock}</span>
          )}
        </td>
        <td className="px-3 py-3 sm:px-4 text-slate-600">
          {row.variant_count > 0 ? (
            <span>
              {row.variant_count} · {row.variant_stock_total} units
            </span>
          ) : (
            "—"
          )}
        </td>
        <td className="px-3 py-3 sm:px-4">
          <Link href={`/products/${row.id}`} className="text-emerald-800 hover:underline text-xs font-medium">
            Edit product
          </Link>
        </td>
      </tr>
      {expanded && row.variant_count > 0 ? (
        <tr className="bg-slate-50/50">
          <td colSpan={8} className="px-4 py-4">
            {variantsLoading ? (
              <AdminInlineLoader label="Loading variants…" />
            ) : variants?.length ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                    <tr>
                      <th className="px-3 py-2 text-left">Weight</th>
                      <th className="px-3 py-2 text-left">SKU</th>
                      <th className="px-3 py-2 text-left">Price</th>
                      <th className="px-3 py-2 text-left">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variants.map((v) => (
                      <VariantStockRow
                        key={v.id}
                        variant={v}
                        onSave={(stock) => onSaveVariantStock(v.id, stock)}
                        disabled={saving}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No variants.</p>
            )}
          </td>
        </tr>
      ) : null}
    </>
  );
}

function VariantStockRow({
  variant,
  onSave,
  disabled,
}: {
  variant: InventoryVariantRow;
  onSave: (stock: number) => void;
  disabled: boolean;
}) {
  const [stock, setStock] = useState(String(variant.stock));
  return (
    <tr>
      <td className="px-3 py-2">{variant.weight}</td>
      <td className="px-3 py-2 font-mono text-xs">{variant.sku}</td>
      <td className="px-3 py-2">₹{Number(variant.price).toFixed(2)}</td>
      <td className="px-3 py-2">
        <StockEditor value={stock} onChange={setStock} onSave={() => onSave(Number(stock))} disabled={disabled} />
      </td>
    </tr>
  );
}

function StockEditor({
  value,
  onChange,
  onSave,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={0}
        max={99999}
        className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm tabular-nums"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="rounded-lg bg-emerald-700 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
        disabled={disabled}
        onClick={onSave}
      >
        Save
      </button>
    </div>
  );
}
