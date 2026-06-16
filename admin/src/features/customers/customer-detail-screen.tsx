"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { AdminPageLoader } from "@/components/loader";
import { formatDate, formatMoney, OrderStatusBadge } from "@/components/status-badge";
import { adminFetchJson } from "@/lib/api-client";
import type { AdminCustomerDetail } from "@/lib/types";

export function CustomerDetailScreen() {
  const params = useParams();
  const id = Number(params.id);

  const detail = useQuery({
    queryKey: ["admin", "customer", id],
    queryFn: () => adminFetchJson<{ data: AdminCustomerDetail }>(`customers/${id}`).then((r) => r.data),
    enabled: Number.isInteger(id) && id > 0,
  });

  if (!Number.isInteger(id) || id <= 0) {
    return <p className="text-sm text-red-700">Invalid customer id.</p>;
  }

  if (detail.isLoading) {
    return <AdminPageLoader label="Loading customer…" />;
  }

  if (detail.isError || !detail.data) {
    return <p className="text-sm text-red-700">Customer not found.</p>;
  }

  const { user, orders } = detail.data;

  return (
    <div>
      <PageHeader
        title={user.name ?? user.email ?? `Customer #${user.id}`}
        description={`Clerk ID: ${user.clerk_id}`}
        actions={
          <Link
            href="/customers"
            className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to customers
          </Link>
        }
      />

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="mt-0.5">{user.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Phone</dt>
            <dd className="mt-0.5">{user.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Joined</dt>
            <dd className="mt-0.5">{formatDate(user.created_at)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Orders</dt>
            <dd className="mt-0.5">{orders.length}</dd>
          </div>
        </dl>
      </section>

      <h2 className="mb-3 text-sm font-semibold text-slate-900">Order history</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-3 py-3 sm:px-4">Order</th>
              <th className="px-3 py-3 sm:px-4">Total</th>
              <th className="px-3 py-3 sm:px-4">Status</th>
              <th className="px-3 py-3 sm:px-4">Payment</th>
              <th className="px-3 py-3 sm:px-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-slate-500">
                  No orders for this customer.
                </td>
              </tr>
            ) : (
              orders.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="px-3 py-3 sm:px-4">
                    <Link href={`/orders/${row.id}`} className="font-medium text-emerald-800 hover:underline">
                      {row.order_number}
                    </Link>
                  </td>
                  <td className="px-3 py-3 sm:px-4">{formatMoney(row.grand_total, row.amount_paise)}</td>
                  <td className="px-3 py-3 sm:px-4">
                    <OrderStatusBadge status={row.status} />
                  </td>
                  <td className="px-3 py-3 sm:px-4 capitalize">{row.payment_status ?? "—"}</td>
                  <td className="px-3 py-3 sm:px-4 text-slate-600">{formatDate(row.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
