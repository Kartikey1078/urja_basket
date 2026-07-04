"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { AdminPageLoader, AdminTableLoader } from "@/components/loader";
import { formatDate, formatMoney, FulfillmentStatusBadge, getOrderFulfillmentStatus, OrderStatusBadge, pendingDeliveryRowClass } from "@/components/status-badge";
import { adminFetchJson } from "@/lib/api-client";
import type { AdminOrderListRow, OrderStatus, PaymentMethod } from "@/lib/types";

const inputClass =
  "mt-1 block w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25";
const btnPrimary =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800";
const btnSecondary =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50";

const STATUSES: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "pending_payment", label: "Pending payment" },
  { value: "confirmed", label: "Confirmed (COD)" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

const USER_FILTERS: { value: "" | "guest" | "registered"; label: string }[] = [
  { value: "", label: "All users" },
  { value: "registered", label: "Registered" },
  { value: "guest", label: "Guest" },
];

const PAY_FILTERS: { value: "" | PaymentMethod; label: string }[] = [
  { value: "", label: "All pay types" },
  { value: "online", label: "Online" },
  { value: "cod", label: "COD" },
];

function buildOrdersApiPath(params: {
  status: string;
  order: string;
  customer: string;
  user: string;
  pay: string;
}) {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.order.trim()) sp.set("order", params.order.trim());
  if (params.customer.trim()) sp.set("customer", params.customer.trim());
  if (params.user) sp.set("user", params.user);
  if (params.pay) sp.set("pay", params.pay);
  const qs = sp.toString();
  return qs ? `orders?${qs}` : "orders";
}

export function OrdersScreen() {
  return (
    <Suspense fallback={<AdminPageLoader />}>
      <OrdersInner />
    </Suspense>
  );
}

function OrdersInner() {
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") ?? "") as OrderStatus | "";
  const order = searchParams.get("order") ?? "";
  const customer = searchParams.get("customer") ?? "";
  const user = searchParams.get("user") ?? "";
  const pay = searchParams.get("pay") ?? "";

  const apiPath = buildOrdersApiPath({ status, order, customer, user, pay });

  const list = useQuery({
    queryKey: ["admin", "orders", status, order, customer, user, pay],
    queryFn: () => adminFetchJson<{ data: AdminOrderListRow[] }>(apiPath).then((r) => r.data),
  });

  const hasActiveFilters = Boolean(status || order || customer || user || pay);

  return (
    <div>
      <PageHeader
        title="Orders"
        description="All storefront orders with customer, payment status, and Razorpay references."
      />

      <form
        className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        action="/orders"
        method="get"
      >
        <label className="block text-sm font-medium text-slate-700">
          Order
          <input
            className={inputClass}
            type="search"
            name="order"
            placeholder="Order number…"
            defaultValue={order}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Customer
          <input
            className={inputClass}
            type="search"
            name="customer"
            placeholder="Name or phone…"
            defaultValue={customer}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          User
          <select className={inputClass} name="user" defaultValue={user}>
            {USER_FILTERS.map((u) => (
              <option key={u.value || "all"} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Pay
          <select className={inputClass} name="pay" defaultValue={pay}>
            {PAY_FILTERS.map((p) => (
              <option key={p.value || "all"} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Status
          <select className={inputClass} name="status" defaultValue={status}>
            {STATUSES.map((s) => (
              <option key={s.value || "all"} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1 xl:col-span-1">
          <button type="submit" className={`${btnPrimary} flex-1`}>
            Filter
          </button>
          {hasActiveFilters ? (
            <Link href="/orders" className={btnSecondary}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {hasActiveFilters ? (
        <p className="mb-4 text-sm text-slate-600">
          Showing filtered results
          {list.data != null ? ` (${list.data.length})` : ""}.
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[1060px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-3 py-3 sm:px-4">Order</th>
              <th className="px-3 py-3 sm:px-4">Customer</th>
              <th className="px-3 py-3 sm:px-4">User</th>
              <th className="px-3 py-3 sm:px-4">Total</th>
              <th className="px-3 py-3 sm:px-4">Status</th>
              <th className="px-3 py-3 sm:px-4">Delivery</th>
              <th className="px-3 py-3 sm:px-4">Pay</th>
              <th className="px-3 py-3 sm:px-4">Payment</th>
              <th className="px-3 py-3 sm:px-4">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.isLoading ? (
              <AdminTableLoader colSpan={9} />
            ) : list.data?.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-slate-500">
                  {hasActiveFilters ? "No orders match these filters." : "No orders yet."}
                </td>
              </tr>
            ) : (
              list.data?.map((row) => (
                <tr key={row.id} className={pendingDeliveryRowClass(row)}>
                  <td className="px-3 py-3 sm:px-4">
                    <Link href={`/orders/${row.id}`} className="font-medium text-emerald-800 hover:underline">
                      {row.order_number}
                    </Link>
                    <p className="text-xs text-slate-500">#{row.id}</p>
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <p className="font-medium text-slate-900">{row.customer_name}</p>
                    <p className="text-xs text-slate-500">{row.customer_phone}</p>
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    {row.user_id ? (
                      <Link href={`/customers/${row.user_id}`} className="text-emerald-800 hover:underline">
                        {row.user_name ?? row.user_email ?? `User #${row.user_id}`}
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-500">Guest</span>
                    )}
                  </td>
                  <td className="px-3 py-3 sm:px-4 whitespace-nowrap">
                    {formatMoney(row.grand_total, row.amount_paise)}
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <OrderStatusBadge status={row.status} />
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <FulfillmentStatusBadge status={getOrderFulfillmentStatus(row)} />
                  </td>
                  <td className="px-3 py-3 sm:px-4 text-xs capitalize text-slate-600">
                    {row.payment_method === "cod" ? "COD" : "Online"}
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    {row.payment_status ? (
                      <span className="text-xs capitalize text-slate-700">{row.payment_status}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-3 sm:px-4 whitespace-nowrap text-slate-600">
                    {formatDate(row.created_at)}
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
