"use client";

import { useQueries } from "@tanstack/react-query";

import { PageHeader } from "@/components/page-header";
import { adminFetchJson } from "@/lib/api-client";
import type { Category, ProductListRow } from "@/lib/types";

export function DashboardScreen() {
  const [cats, products, reviews] = useQueries({
    queries: [
      {
        queryKey: ["admin", "categories"],
        queryFn: () => adminFetchJson<{ data: Category[] }>("categories").then((r) => r.data),
      },
      {
        queryKey: ["admin", "products"],
        queryFn: () => adminFetchJson<{ data: ProductListRow[] }>("products").then((r) => r.data),
      },
      {
        queryKey: ["admin", "reviews"],
        queryFn: () => adminFetchJson<{ data: { id: number }[] }>("reviews").then((r) => r.data),
      },
    ],
  });

  const err = cats.error ?? products.error ?? reviews.error;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Snapshot of catalog data from the Urja Basket API (via secure proxy)."
      />
      {err ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {(err as Error).message}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Categories" value={cats.data?.length} loading={cats.isPending} />
        <StatCard label="Products" value={products.data?.length} loading={products.isPending} />
        <StatCard label="Reviews" value={reviews.data?.length} loading={reviews.isPending} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
        {loading ? "—" : value ?? "—"}
      </p>
    </div>
  );
}
