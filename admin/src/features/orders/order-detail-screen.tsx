"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { AdminPageLoader } from "@/components/loader";
import {
  formatDate,
  formatMoney,
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/status-badge";
import { adminFetchJson } from "@/lib/api-client";
import { adminToast } from "@/lib/admin-toast";
import type { AdminOrderDetail } from "@/lib/types";

const btnPrimary =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";
const btnDanger =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-red-300 bg-white px-4 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:opacity-50";

export function OrderDetailScreen() {
  const params = useParams();
  const id = Number(params.id);
  const qc = useQueryClient();

  const detail = useQuery({
    queryKey: ["admin", "order", id],
    queryFn: () => adminFetchJson<{ data: AdminOrderDetail }>(`orders/${id}`).then((r) => r.data),
    enabled: Number.isInteger(id) && id > 0,
  });

  const updateFulfillment = useMutation({
    mutationFn: (fulfillmentStatus: string) =>
      adminFetchJson(`orders/${id}/fulfillment`, {
        method: "PATCH",
        json: { fulfillmentStatus },
      }),
    onSuccess: () => {
      adminToast.updated("Delivery status");
      void qc.invalidateQueries({ queryKey: ["admin", "order", id] });
      void qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      void qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
    },
    onError: (e) => adminToast.fromError(e, "Update failed"),
  });

  const markCodPaid = useMutation({
    mutationFn: () =>
      adminFetchJson<{ data: { orderNumber: string; status: string } }>(`orders/${id}/mark-cod-paid`, {
        method: "PATCH",
      }),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ["admin", "order", id] });
      void qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      void qc.invalidateQueries({ queryKey: ["admin", "payments"] });
      adminToast.success(`Marked ${res.data.orderNumber} as paid (cash collected).`);
    },
    onError: (e) => adminToast.fromError(e, "Could not update payment"),
  });

  const confirmCod = useMutation({
    mutationFn: () =>
      adminFetchJson<{ data: { orderNumber: string; inventoryDeducted: boolean } }>(
        `orders/${id}/confirm`,
        { method: "PATCH" }
      ),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ["admin", "order", id] });
      void qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      void qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
      const stockMsg = res.data.inventoryDeducted ? " Stock has been reserved." : "";
      adminToast.success(`Order ${res.data.orderNumber} confirmed.${stockMsg}`);
    },
    onError: (e) => adminToast.fromError(e, "Could not confirm order"),
  });

  const cancelOrder = useMutation({
    mutationFn: () =>
      adminFetchJson<{ data: { orderNumber: string; inventoryRestored: boolean } }>(
        `orders/${id}/cancel`,
        { method: "PATCH" }
      ),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ["admin", "order", id] });
      void qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      void qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
      const stockMsg = res.data.inventoryRestored ? " Stock has been restored." : "";
      adminToast.success(`Order ${res.data.orderNumber} cancelled.${stockMsg}`);
    },
    onError: (e) => adminToast.fromError(e, "Could not cancel order"),
  });

  const refundOrder = useMutation({
    mutationFn: () =>
      adminFetchJson<{ data: { orderNumber: string; inventoryRestored: boolean } }>(
        `orders/${id}/refund`,
        { method: "PATCH" }
      ),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ["admin", "order", id] });
      void qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      void qc.invalidateQueries({ queryKey: ["admin", "payments"] });
      void qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
      const stockMsg = res.data.inventoryRestored ? " Stock has been restored." : "";
      adminToast.success(`Order ${res.data.orderNumber} refunded.${stockMsg}`);
    },
    onError: (e) => adminToast.fromError(e, "Could not refund order"),
  });

  if (!Number.isInteger(id) || id <= 0) {
    return <p className="text-sm text-red-700">Invalid order id.</p>;
  }

  if (detail.isLoading) {
    return <AdminPageLoader label="Loading order…" />;
  }

  if (detail.isError || !detail.data) {
    return <p className="text-sm text-red-700">Order not found.</p>;
  }

  const { order, items, payment, user } = detail.data;
  const addr = order.address_snapshot;
  const paymentMethod = order.payment_method ?? "online";
  const fulfillment = order.fulfillment_status ?? "order_placed";
  const canMarkCodPaid =
    paymentMethod === "cod" && order.status === "confirmed" && payment?.status === "pending_collection";
  const canConfirmCod =
    paymentMethod === "cod" &&
    order.status === "pending_payment" &&
    fulfillment !== "cancelled";
  const inventoryReserved = Boolean(order.inventory_deducted_at);
  const canCancelOrder =
    order.status !== "cancelled" &&
    fulfillment !== "cancelled" &&
    !(paymentMethod === "online" && order.status === "paid" && fulfillment === "delivered");
  const canRefundOrder =
    paymentMethod === "online" &&
    order.status === "paid" &&
    payment?.status === "paid";

  return (
    <div>
      <PageHeader
        title={order.order_number}
        description={`Order #${order.id} · ${formatDate(order.created_at)}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {canConfirmCod ? (
              <button
                type="button"
                className={btnPrimary}
                disabled={confirmCod.isPending}
                onClick={() => confirmCod.mutate()}
              >
                {confirmCod.isPending ? "Confirming…" : "Confirm order (reserve stock)"}
              </button>
            ) : null}
            {canMarkCodPaid ? (
              <button
                type="button"
                className={btnPrimary}
                disabled={markCodPaid.isPending}
                onClick={() => markCodPaid.mutate()}
              >
                {markCodPaid.isPending ? "Updating…" : "Mark cash collected (paid)"}
              </button>
            ) : null}
            {canRefundOrder ? (
              <button
                type="button"
                className={btnDanger}
                disabled={refundOrder.isPending}
                onClick={() => refundOrder.mutate()}
              >
                {refundOrder.isPending ? "Refunding…" : "Refund & restore stock"}
              </button>
            ) : null}
            {canCancelOrder ? (
              <button
                type="button"
                className={btnDanger}
                disabled={cancelOrder.isPending}
                onClick={() => cancelOrder.mutate()}
              >
                {cancelOrder.isPending ? "Cancelling…" : "Cancel order"}
              </button>
            ) : null}
            <Link
              href="/orders"
              className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back to orders
            </Link>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Summary</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Status</dt>
              <dd className="mt-0.5">
                <OrderStatusBadge status={order.status} />
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Payment method</dt>
              <dd className="mt-0.5 capitalize font-medium">
                {paymentMethod === "cod" ? "Cash on delivery" : "Online"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500 mb-1">Fulfillment (customer tracking)</dt>
              <dd className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={fulfillment}
                  disabled={updateFulfillment.isPending}
                  onChange={(e) => updateFulfillment.mutate(e.target.value)}
                >
                  <option value="order_placed">Order placed</option>
                  <option value="preparing">Getting packed</option>
                  <option value="out_for_delivery">On the way</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <span className="text-xs text-slate-500">Updates live on customer track page</span>
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Inventory</dt>
              <dd className="mt-0.5 font-medium">
                {inventoryReserved ? (
                  <span className="text-emerald-800">Stock deducted</span>
                ) : (
                  <span className="text-amber-800">Not yet deducted</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Grand total</dt>
              <dd className="mt-0.5 font-medium">{formatMoney(order.grand_total, order.amount_paise)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Delivery slot</dt>
              <dd className="mt-0.5 capitalize">{order.delivery_slot ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Paid at</dt>
              <dd className="mt-0.5">{formatDate(order.paid_at)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Subtotal</dt>
              <dd className="mt-0.5">₹{Number(order.subtotal).toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Delivery fee</dt>
              <dd className="mt-0.5">₹{Number(order.delivery_fee).toFixed(2)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Customer</h2>
          <p className="mt-2 font-medium text-slate-900">{order.customer_name}</p>
          <p className="text-sm text-slate-600">{order.customer_phone}</p>
          {user ? (
            <p className="mt-2">
              <Link href={`/customers/${user.id}`} className="text-sm text-emerald-800 hover:underline">
                {user.name ?? user.email ?? `User #${user.id}`}
              </Link>
              <span className="block text-xs text-slate-500">Clerk: {user.clerk_id}</span>
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">Guest checkout (no account)</p>
          )}
        </section>
      </div>

      {paymentMethod === "online" && order.status === "paid" ? (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          Prepaid online order — stock is reserved immediately when payment succeeds. Use{" "}
          <strong>Refund &amp; restore stock</strong> if the order is cancelled or returned after
          delivery.
        </div>
      ) : null}

      {paymentMethod === "cod" && order.status === "pending_payment" ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Awaiting confirmation — confirm this COD order to reserve inventory, or move fulfillment to{" "}
          <strong>Getting packed</strong> to deduct stock automatically.
        </div>
      ) : null}

      {paymentMethod === "cod" && order.status === "confirmed" ? (
        <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          Cash on delivery — payment is due when the order is delivered. Use{" "}
          <strong>Mark cash collected</strong> after the delivery person receives payment.
        </div>
      ) : null}

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Delivery address</h2>
        <p className="mt-2 text-sm text-slate-800">{addr.formatted}</p>
        <p className="text-sm text-slate-600">
          {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
        </p>
      </section>

      {payment ? (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Payment</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Status</dt>
              <dd className="mt-0.5">
                <PaymentStatusBadge status={payment.status} />
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Amount</dt>
              <dd className="mt-0.5">{formatMoney(0, payment.amount_paise)}</dd>
            </div>
            {payment.razorpay_order_id ? (
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Reference</dt>
                <dd className="mt-0.5 font-mono text-xs break-all">{payment.razorpay_order_id}</dd>
              </div>
            ) : null}
            {payment.razorpay_payment_id ? (
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Collection / payment id</dt>
                <dd className="mt-0.5 font-mono text-xs break-all">{payment.razorpay_payment_id}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">Line items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
              <tr>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Unit</th>
                <th className="px-4 py-2">Line total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-xs text-slate-500">{item.product_slug}</p>
                  </td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">₹{Number(item.unit_price).toFixed(2)}</td>
                  <td className="px-4 py-3">₹{Number(item.line_total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
