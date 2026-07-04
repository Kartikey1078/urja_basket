"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { AdminPageLoader, AdminTableLoader } from "@/components/loader";
import { adminFetchJson } from "@/lib/api-client";
import { cn } from "@/lib/cn";

type PosOrderRow = {
  id: number;
  order_number: string;
  status: string;
  grand_total: string;
  created_at: string;
  paid_at: string | null;
};

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  pending_payment: "bg-amber-100 text-amber-900",
  cancelled: "bg-slate-100 text-slate-600",
  failed: "bg-red-100 text-red-800",
};

function formatInr(amount: string) {
  return `₹${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function PosOrdersScreen() {
  return (
    <Suspense fallback={<AdminPageLoader label="Loading POS orders…" />}>
      <PosOrdersInner />
    </Suspense>
  );
}

function PosOrdersInner() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";

  const list = useQuery({
    queryKey: ["admin", "pos", "orders", q, status],
    queryFn: () => {
      const sp = new URLSearchParams();
      if (q) sp.set("q", q);
      if (status) sp.set("status", status);
      const qs = sp.toString();
      return adminFetchJson<{ items: PosOrderRow[]; meta: { total: number } }>(
        qs ? `pos/orders?${qs}` : "pos/orders"
      );
    },
  });

  return (
    <div>
      <PageHeader
        title="POS orders"
        description="Walk-in sales from the billing terminal."
        actions={
          <Link
            href="/pos"
            className="inline-flex min-h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Open billing
          </Link>
        }
      />

      <form className="mb-6 flex flex-wrap gap-3" action="/pos/orders" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Order number…"
          className="min-h-11 flex-1 rounded-lg border border-slate-300 px-3 text-sm sm:max-w-xs"
        />
        <select
          name="status"
          defaultValue={status}
          className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending_payment">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-slate-800 px-4 text-sm font-semibold text-white"
        >
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[640px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.isLoading ? <AdminTableLoader colSpan={4} /> : null}
            {list.data?.items.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <Link href={`/pos/orders/${row.id}`} className="font-medium text-blue-700 hover:underline">
                    {row.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
                      statusStyles[row.status] ?? "bg-slate-100"
                    )}
                  >
                    {row.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold tabular-nums">{formatInr(row.grand_total)}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(row.created_at)}</td>
              </tr>
            ))}
            {!list.isLoading && list.data?.items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  No POS orders yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
