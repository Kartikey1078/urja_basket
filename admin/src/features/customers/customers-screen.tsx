"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { AdminTableLoader } from "@/components/loader";
import { formatDate, formatMoney } from "@/components/status-badge";
import { adminFetchJson } from "@/lib/api-client";
import type { AdminCustomerListRow } from "@/lib/types";

export function CustomersScreen() {
  const list = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: () => adminFetchJson<{ data: AdminCustomerListRow[] }>("customers").then((r) => r.data),
  });

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Registered users synced from Clerk, with order counts and spend."
      />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[880px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-3 py-3 sm:px-4">Customer</th>
              <th className="px-3 py-3 sm:px-4">Contact</th>
              <th className="px-3 py-3 sm:px-4">Orders</th>
              <th className="px-3 py-3 sm:px-4">Paid orders</th>
              <th className="px-3 py-3 sm:px-4">Total spent</th>
              <th className="px-3 py-3 sm:px-4">Last order</th>
              <th className="px-3 py-3 sm:px-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.isLoading ? (
              <AdminTableLoader colSpan={7} />
            ) : list.data?.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-slate-500">
                  No customers yet.
                </td>
              </tr>
            ) : (
              list.data?.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="px-3 py-3 sm:px-4">
                    <Link href={`/customers/${row.id}`} className="font-medium text-emerald-800 hover:underline">
                      {row.name ?? row.email ?? `User #${row.id}`}
                    </Link>
                    <p className="text-xs text-slate-500 font-mono truncate max-w-[200px]">{row.clerk_id}</p>
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <p className="text-slate-800">{row.email ?? "—"}</p>
                    <p className="text-xs text-slate-500">{row.phone ?? ""}</p>
                  </td>
                  <td className="px-3 py-3 sm:px-4">{row.order_count}</td>
                  <td className="px-3 py-3 sm:px-4">{row.paid_order_count}</td>
                  <td className="px-3 py-3 sm:px-4 whitespace-nowrap">{formatMoney(row.total_spent)}</td>
                  <td className="px-3 py-3 sm:px-4 whitespace-nowrap text-slate-600">
                    {formatDate(row.last_order_at)}
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
