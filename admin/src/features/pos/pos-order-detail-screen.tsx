"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { AdminPageLoader } from "@/components/loader";
import { AdminApiError, adminFetchJson } from "@/lib/api-client";
import { adminToast } from "@/lib/admin-toast";

type PosOrderDetail = {
  order: {
    id: number;
    order_number: string;
    status: string;
    subtotal: string;
    grand_total: string;
    created_at: string;
    paid_at: string | null;
  };
  items: {
    id: number;
    product_name: string;
    variant_label: string | null;
    quantity: number;
    unit_price: string;
    line_total: string;
  }[];
  payment: {
    method: string;
    status: string;
    amount: string;
    cash_received: string | null;
    cash_change: string | null;
  } | null;
};

function formatInr(n: string | number) {
  const v = typeof n === "string" ? Number(n) : n;
  return `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export function PosOrderDetailScreen() {
  const params = useParams();
  const id = Number(params.id);
  const qc = useQueryClient();

  const detail = useQuery({
    queryKey: ["admin", "pos", "order", id],
    queryFn: () => adminFetchJson<{ data: PosOrderDetail }>(`pos/orders/${id}`).then((r) => r.data),
    enabled: Number.isInteger(id) && id > 0,
  });

  const cancel = useMutation({
    mutationFn: () =>
      adminFetchJson(`pos/orders/${id}/cancel`, { method: "POST" }),
    onSuccess: () => {
      adminToast.success("Order cancelled");
      void qc.invalidateQueries({ queryKey: ["admin", "pos", "order", id] });
      void qc.invalidateQueries({ queryKey: ["admin", "pos", "orders"] });
    },
    onError: (e) =>
      adminToast.error(e instanceof AdminApiError ? e.message : "Cancel failed"),
  });

  if (!Number.isInteger(id) || id <= 0) {
    return <p className="text-sm text-red-700">Invalid order id.</p>;
  }

  if (detail.isLoading) return <AdminPageLoader label="Loading order…" />;
  if (detail.isError || !detail.data) {
    return <p className="text-sm text-red-700">Order not found.</p>;
  }

  const { order, items, payment } = detail.data;
  const canCancel = order.status === "pending_payment";

  function printInvoice() {
    window.open(`/api/backend/pos/orders/${id}/invoice`, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <PageHeader
        title={order.order_number}
        description={`POS order #${order.id}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {order.status === "paid" ? (
              <button
                type="button"
                onClick={printInvoice}
                className="min-h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Print invoice
              </button>
            ) : null}
            {canCancel ? (
              <button
                type="button"
                disabled={cancel.isPending}
                onClick={() => cancel.mutate()}
                className="min-h-10 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-800"
              >
                Cancel order
              </button>
            ) : null}
            <Link
              href="/pos/orders"
              className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700"
            >
              Back
            </Link>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Status</dt>
              <dd className="font-medium capitalize">{order.status.replace(/_/g, " ")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Total</dt>
              <dd className="text-lg font-bold">{formatInr(order.grand_total)}</dd>
            </div>
            {payment ? (
              <>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Payment</dt>
                  <dd className="capitalize">{payment.method.replace(/_/g, " ")}</dd>
                </div>
                {payment.cash_change != null ? (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Change</dt>
                    <dd>{formatInr(payment.cash_change)}</dd>
                  </div>
                ) : null}
              </>
            ) : null}
          </dl>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  {item.product_name}
                  {item.variant_label ? (
                    <span className="text-slate-500"> · {item.variant_label}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3 tabular-nums">{formatInr(item.unit_price)}</td>
                <td className="px-4 py-3 tabular-nums font-medium">{formatInr(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
