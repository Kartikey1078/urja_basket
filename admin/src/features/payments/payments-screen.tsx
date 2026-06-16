"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";

import { PageHeader } from "@/components/page-header";
import { AdminPageLoader, AdminTableLoader } from "@/components/loader";
import {
  formatDate,
  formatMoney,
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/status-badge";
import { adminFetchJson } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import type { AdminPaymentListRow, OrderStatus, PaginatedMeta, PaymentStatus } from "@/lib/types";

const inputClass =
  "mt-1 block w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25";
const btnPrimary =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";
const btnSecondary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50";

const PAYMENT_STATUSES: { value: PaymentStatus | ""; label: string }[] = [
  { value: "", label: "All payment statuses" },
  { value: "created", label: "Created" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "pending_collection", label: "Pending collection" },
];

const ORDER_STATUSES: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "All order statuses" },
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

function buildPaymentsQuery(params: {
  status: string;
  order: string;
  customer: string;
  payment: string;
  orderStatus: string;
  user: string;
  page: string;
  limit: string;
}) {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.order.trim()) sp.set("order", params.order.trim());
  if (params.customer.trim()) sp.set("customer", params.customer.trim());
  if (params.payment.trim()) sp.set("payment", params.payment.trim());
  if (params.orderStatus) sp.set("orderStatus", params.orderStatus);
  if (params.user) sp.set("user", params.user);
  if (params.page && params.page !== "1") sp.set("page", params.page);
  if (params.limit && params.limit !== "20") sp.set("limit", params.limit);
  const qs = sp.toString();
  return qs ? `payments?${qs}` : "payments";
}

function paginationWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

export function PaymentsScreen() {
  return (
    <Suspense fallback={<AdminPageLoader />}>
      <PaymentsInner />
    </Suspense>
  );
}

function PaymentsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = (searchParams.get("status") ?? "") as PaymentStatus | "";
  const order = searchParams.get("order") ?? "";
  const customer = searchParams.get("customer") ?? "";
  const payment = searchParams.get("payment") ?? "";
  const orderStatus = (searchParams.get("orderStatus") ?? "") as OrderStatus | "";
  const user = searchParams.get("user") ?? "";
  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "20";

  const apiPath = buildPaymentsQuery({
    status,
    order,
    customer,
    payment,
    orderStatus,
    user,
    page,
    limit,
  });

  const list = useQuery({
    queryKey: ["admin", "payments", status, order, customer, payment, orderStatus, user, page, limit],
    queryFn: () =>
      adminFetchJson<{ data: AdminPaymentListRow[]; meta: PaginatedMeta }>(apiPath).then((r) => ({
        items: r.data,
        meta: r.meta,
      })),
  });

  const applyFilters = useCallback(
    (overrides?: Partial<{
      status: string;
      order: string;
      customer: string;
      payment: string;
      orderStatus: string;
      user: string;
      page: string;
      limit: string;
    }>) => {
      const next = {
        status: overrides?.status ?? status,
        order: overrides?.order ?? order,
        customer: overrides?.customer ?? customer,
        payment: overrides?.payment ?? payment,
        orderStatus: overrides?.orderStatus ?? orderStatus,
        user: overrides?.user ?? user,
        page: overrides?.page ?? "1",
        limit: overrides?.limit ?? limit,
      };
      const path = buildPaymentsQuery(next);
      const qs = path.includes("?") ? path.split("?")[1] : "";
      router.push(qs ? `/payments?${qs}` : "/payments");
    },
    [router, status, order, customer, payment, orderStatus, user, limit]
  );

  const meta = list.data?.meta;
  const items = list.data?.items ?? [];
  const pageNum = meta?.page ?? (Number(page) || 1);
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;
  const limitNum = meta?.limit ?? (Number(limit) || 20);
  const rangeStart = total === 0 ? 0 : (pageNum - 1) * limitNum + 1;
  const rangeEnd = Math.min(pageNum * limitNum, total);

  const hasActiveFilters = Boolean(
    status || order || customer || payment || orderStatus || user
  );

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Razorpay payment records linked to orders and customers."
      />

      <form
        className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          applyFilters({
            status: String(fd.get("status") ?? ""),
            order: String(fd.get("order") ?? ""),
            customer: String(fd.get("customer") ?? ""),
            payment: String(fd.get("payment") ?? ""),
            orderStatus: String(fd.get("orderStatus") ?? ""),
            user: String(fd.get("user") ?? ""),
            page: "1",
          });
        }}
      >
        <label className="block text-sm font-medium text-slate-700">
          Payment ID
          <input
            className={inputClass}
            type="search"
            name="payment"
            placeholder="Razorpay ID…"
            defaultValue={payment}
          />
        </label>

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
          Payment status
          <select className={inputClass} name="status" defaultValue={status}>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s.value || "all"} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Order status
          <select className={inputClass} name="orderStatus" defaultValue={orderStatus}>
            {ORDER_STATUSES.map((s) => (
              <option key={s.value || "all"} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-2 sm:col-span-2">
          <button type="submit" className={`${btnPrimary} flex-1`}>
            Filter
          </button>
          {hasActiveFilters ? (
            <Link href="/payments" className={btnSecondary}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <p className="mb-3 text-sm text-slate-600">
        {total === 0
          ? hasActiveFilters
            ? "No payments match these filters."
            : "No payments yet."
          : `Showing ${rangeStart}–${rangeEnd} of ${total} payment${total === 1 ? "" : "s"}`}
      </p>

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
              <AdminTableLoader colSpan={7} />
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-slate-500">
                  {hasActiveFilters ? "No payments match these filters." : "No payments yet."}
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="px-3 py-3 sm:px-4">
                    <p className="font-mono text-xs break-all">
                      {row.razorpay_payment_id ?? row.razorpay_order_id}
                    </p>
                    <p className="text-xs text-slate-500">#{row.id}</p>
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <Link
                      href={`/orders/${row.order_id}`}
                      className="font-medium text-emerald-800 hover:underline"
                    >
                      {row.order_number}
                    </Link>
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <p className="font-medium">{row.customer_name}</p>
                    <p className="text-xs text-slate-500">{row.customer_phone}</p>
                    {row.user_id ? (
                      <Link
                        href={`/customers/${row.user_id}`}
                        className="text-xs text-emerald-800 hover:underline"
                      >
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

        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-3">
            <button
              type="button"
              className={btnSecondary}
              disabled={pageNum <= 1 || list.isFetching}
              onClick={() => applyFilters({ page: String(pageNum - 1) })}
            >
              <ChevronLeft className="size-4" aria-hidden />
              Previous
            </button>
            <div className="flex flex-wrap items-center justify-center gap-1">
              {paginationWindow(pageNum, totalPages).map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-slate-400">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={cn(
                      "min-h-9 min-w-9 rounded-lg text-sm font-medium transition",
                      p === pageNum
                        ? "bg-emerald-700 text-white"
                        : "text-slate-700 hover:bg-white"
                    )}
                    disabled={list.isFetching}
                    onClick={() => applyFilters({ page: String(p) })}
                  >
                    {p}
                  </button>
                )
              )}
            </div>
            <button
              type="button"
              className={btnSecondary}
              disabled={pageNum >= totalPages || list.isFetching}
              onClick={() => applyFilters({ page: String(pageNum + 1) })}
            >
              Next
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
