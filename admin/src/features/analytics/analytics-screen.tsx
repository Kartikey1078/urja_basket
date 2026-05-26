"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { formatDate, formatMoney, OrderStatusBadge } from "@/components/status-badge";
import { adminFetchJson } from "@/lib/api-client";
import type { AnalyticsOverview } from "@/lib/types";

export function AnalyticsScreen() {
  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => adminFetchJson<{ data: AnalyticsOverview }>("analytics").then((r) => r.data),
  });

  if (isPending) {
    return <p className="text-sm text-slate-500">Loading analytics…</p>;
  }

  if (error || !data) {
    return (
      <div>
        <PageHeader title="Analytics" description="Business overview from orders and catalog." />
        <p className="text-sm text-red-700">{(error as Error)?.message ?? "Failed to load analytics"}</p>
      </div>
    );
  }

  const maxRevenue = Math.max(
    ...data.revenueByDay.map((d) => Number(d.revenue)),
    1
  );

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Revenue, orders, payments, and catalog health — live from your database."
      />

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total revenue" value={formatMoney(data.revenue.total)} hint="All paid orders" />
        <MetricCard label="Today" value={formatMoney(data.revenue.today)} hint="Paid today" />
        <MetricCard label="Last 7 days" value={formatMoney(data.revenue.week)} />
        <MetricCard label="Last 30 days" value={formatMoney(data.revenue.month)} />
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Orders" value={String(data.orders.total)} hint={`${data.orders.paid} paid`} />
        <MetricCard label="Orders today" value={String(data.orders.today)} hint={`${data.orders.week} this week`} />
        <MetricCard label="Customers" value={String(data.customers.total)} hint={`${data.customers.with_orders} ordered`} />
        <MetricCard
          label="Stock alerts"
          value={String(data.catalog.low_stock_products + data.catalog.out_of_stock_products)}
          hint={`${data.catalog.out_of_stock_products} out · ${data.catalog.low_stock_products} low`}
          href="/inventory?stockStatus=out_of_stock"
        />
      </section>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Revenue (last 7 days)</h2>
          <p className="mt-1 text-xs text-slate-500">Paid orders only</p>
          <div className="mt-6 flex items-end gap-2 h-40">
            {data.revenueByDay.length === 0 ? (
              <p className="text-sm text-slate-500">No paid orders in this period yet.</p>
            ) : (
              data.revenueByDay.map((day) => {
                const h = Math.max(8, (Number(day.revenue) / maxRevenue) * 100);
                return (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-1 min-w-0">
                    <span className="text-[10px] font-medium text-slate-700 tabular-nums">
                      ₹{Number(day.revenue).toFixed(0)}
                    </span>
                    <div
                      className="w-full max-w-[48px] rounded-t-md bg-emerald-600/90 transition-all"
                      style={{ height: `${h}%` }}
                      title={`${day.order_count} orders`}
                    />
                    <span className="text-[10px] text-slate-500 truncate w-full text-center">
                      {day.date.slice(5)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Orders by status</h2>
          <ul className="mt-4 space-y-3">
            {data.ordersByStatus.map((row) => {
              const pct = data.orders.total > 0 ? (row.count / data.orders.total) * 100 : 0;
              return (
                <li key={row.status}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <OrderStatusBadge status={row.status} />
                    <span className="tabular-nums font-medium text-slate-900">{row.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-600/80"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="font-semibold text-slate-900">{data.payments.paid}</p>
              <p className="text-slate-500">Payments paid</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="font-semibold text-slate-900">{data.payments.created}</p>
              <p className="text-slate-500">Pending</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="font-semibold text-slate-900">{data.catalog.products}</p>
              <p className="text-slate-500">Products</p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Top sellers</h2>
            <span className="text-xs text-slate-500">By units (paid orders)</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {data.topProducts.length === 0 ? (
              <li className="px-4 py-6 text-sm text-slate-500">No sales data yet.</li>
            ) : (
              data.topProducts.map((p, i) => (
                <li key={p.product_slug} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <span className="mr-2 text-xs font-bold text-slate-400">#{i + 1}</span>
                    <span className="font-medium text-slate-900">{p.product_name}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-medium tabular-nums">{p.units_sold} sold</p>
                    <p className="text-xs text-slate-500">{formatMoney(p.revenue)}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent orders</h2>
            <Link href="/orders" className="text-xs font-medium text-emerald-800 hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {data.recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <Link href={`/orders/${o.id}`} className="font-medium text-emerald-800 hover:underline">
                    {o.order_number}
                  </Link>
                  <p className="truncate text-xs text-slate-500">{o.customer_name}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-medium">{formatMoney(o.grand_total)}</p>
                  <p className="text-xs text-slate-500">{formatDate(o.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm h-full">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block transition hover:border-emerald-300 hover:shadow-md rounded-xl">
        {inner}
      </Link>
    );
  }
  return inner;
}
