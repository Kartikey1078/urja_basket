"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import {
  formatDate,
  formatMoney,
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/status-badge";
import { adminFetchJson } from "@/lib/api-client";
import type { AdminPaymentListRow, PaymentStatus } from "@/lib/types";

const inputClass =
  "mt-1 block w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25";
const btnPrimary =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800";

const STATUSES: { value: PaymentStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "created", label: "Created" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
];

export function PaymentsScreen() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
      <PaymentsInner />
    </Suspense>
  );
}

function PaymentsInner() {
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") ?? "") as PaymentStatus | "";
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";

  const list = useQuery({
    queryKey: ["admin", "payments", status],
    queryFn: () => adminFetchJson<{ data: AdminPaymentListRow[] }>(`payments${qs}`).then((r) => r.data),
  });

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Razorpay payment records linked to orders and customers."
      />

      <form className="mb-6 flex max-w-md flex-col gap-3 sm:flex-row sm:items-end" action="/payments" method="get">
        <label className="block flex-1 text-sm font-medium text-slate-700">
          Status
          <select className={inputClass} name="status" defaultValue={status}>
            {STATUSES.map((s) => (
              <option key={s.value || "all"} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={`${btnPrimary} shrink-0`}>
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[1000px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-3 py-3 sm:px-4">Payment</th>
              <th className="px-3 py-3 sm:px-4">Order</th>
              <th className="px-3 py-3 sm:px-4">Customer</th>
              <th className="px-3 py-3 sm:px-4">Amount</th>
              <th className="px-3 py-3 sm:px-4">Payment status</th>
              <th className="px-3 py-3 sm:px-4">Order status</th>
              <th className="px-3 py-3 sm:px-4">Paid at</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : list.data?.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-slate-500">
                  No payments yet.
                </td>
              </tr>
            ) : (
              list.data?.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="px-3 py-3 sm:px-4">
                    <p className="font-mono text-xs break-all">{row.razorpay_payment_id ?? row.razorpay_order_id}</p>
                    <p className="text-xs text-slate-500">#{row.id}</p>
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <Link href={`/orders/${row.order_id}`} className="font-medium text-emerald-800 hover:underline">
                      {row.order_number}
                    </Link>
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <p className="font-medium">{row.customer_name}</p>
                    <p className="text-xs text-slate-500">{row.customer_phone}</p>
                    {row.user_id ? (
                      <Link href={`/customers/${row.user_id}`} className="text-xs text-emerald-800 hover:underline">
                        {row.user_email ?? `User #${row.user_id}`}
                      </Link>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 sm:px-4 whitespace-nowrap">
                    {formatMoney(0, row.amount_paise)}
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <PaymentStatusBadge status={row.status} />
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <OrderStatusBadge status={row.order_status} />
                  </td>
                  <td className="px-3 py-3 sm:px-4 whitespace-nowrap text-slate-600">
                    {formatDate(row.paid_at ?? row.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
