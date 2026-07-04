"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ShieldAlert } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { AdminTableLoader } from "@/components/loader";
import { adminFetchJson } from "@/lib/api-client";
import { adminToast } from "@/lib/admin-toast";
import type { PaginatedMeta } from "@/lib/types";

type CouponRow = {
  id: number;
  code: string;
  title: string;
  description: string | null;
  type: string;
  discountValue: number;
  maxDiscount: number | null;
  minOrderAmount: number;
  freeDelivery: boolean;
  usageLimitTotal: number | null;
  usageLimitPerUser: number;
  timesUsed: number;
  newUsersOnly: boolean;
  firstOrderOnly: boolean;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
};

type CouponAnalytics = {
  activeCoupons: number;
  totalRedemptions: number;
  confirmedDiscount: string;
  abuseLast24h: number;
};

const inputClass =
  "mt-1 block w-full min-h-10 rounded-lg border border-slate-300 px-3 text-sm";
const btnPrimary =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";

const COUPON_TYPES = [
  "percentage",
  "flat",
  "free_delivery",
  "first_order",
  "flash_sale",
  "referral",
  "cashback",
  "cart_value",
] as const;

export function CouponsScreen() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    type: "flat" as (typeof COUPON_TYPES)[number],
    discountValue: "50",
    maxDiscount: "",
    minOrderAmount: "199",
    freeDelivery: false,
    usageLimitTotal: "",
    usageLimitPerUser: "1",
    firstOrderOnly: false,
    newUsersOnly: false,
    isActive: true,
  });

  const analytics = useQuery({
    queryKey: ["admin", "coupons", "analytics"],
    queryFn: () =>
      adminFetchJson<{ data: CouponAnalytics }>("coupons/analytics").then((r) => r.data),
  });

  const list = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: () =>
      adminFetchJson<{ data: CouponRow[]; meta: PaginatedMeta }>("coupons?limit=50").then(
        (r) => r
      ),
  });

  const create = useMutation({
    mutationFn: () =>
      adminFetchJson<{ data: CouponRow }>("coupons", {
        method: "POST",
        json: {
          code: form.code,
          title: form.title,
          description: form.description || null,
          type: form.type,
          discountValue: Number(form.discountValue),
          maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
          minOrderAmount: Number(form.minOrderAmount),
          freeDelivery: form.freeDelivery,
          usageLimitTotal: form.usageLimitTotal ? Number(form.usageLimitTotal) : null,
          usageLimitPerUser: Number(form.usageLimitPerUser),
          firstOrderOnly: form.firstOrderOnly,
          newUsersOnly: form.newUsersOnly,
          isActive: form.isActive,
        },
      }),
    onSuccess: () => {
      adminToast.created("Coupon");
      setShowForm(false);
      void qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (e) => adminToast.fromError(e, "Create failed"),
  });

  const toggleActive = useMutation({
    mutationFn: (row: CouponRow) =>
      adminFetchJson(`coupons/${row.id}`, {
        method: "PATCH",
        json: { isActive: !row.isActive },
      }),
    onSuccess: (_data, row) => {
      adminToast.success(row.isActive ? "Coupon deactivated." : "Coupon activated.");
      void qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (e) => adminToast.fromError(e),
  });

  const stats = analytics.data;

  return (
    <div>
      <PageHeader
        title="Coupons & offers"
        description="Create campaigns, monitor redemptions, and review abuse signals."
        actions={
          <button type="button" className={btnPrimary} onClick={() => setShowForm((v) => !v)}>
            <Plus className="mr-2 size-4" />
            New coupon
          </button>
        }
      />

      {stats ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Active coupons" value={String(stats.activeCoupons)} />
          <Stat label="Redemptions" value={String(stats.totalRedemptions)} />
          <Stat label="Discount given" value={`₹${stats.confirmedDiscount}`} />
          <Stat
            label="Abuse (24h)"
            value={String(stats.abuseLast24h)}
            icon={<ShieldAlert className="size-4 text-amber-600" />}
          />
        </div>
      ) : null}

      {showForm ? (
        <form
          className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <Field label="Code">
            <input
              className={inputClass}
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              required
            />
          </Field>
          <Field label="Title">
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </Field>
          <Field label="Type">
            <select
              className={inputClass}
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as (typeof COUPON_TYPES)[number] }))
              }
            >
              {COUPON_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Discount value">
            <input
              className={inputClass}
              type="number"
              min={0}
              value={form.discountValue}
              onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
            />
          </Field>
          <Field label="Max discount (₹)">
            <input
              className={inputClass}
              type="number"
              min={0}
              value={form.maxDiscount}
              onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
            />
          </Field>
          <Field label="Min order (₹)">
            <input
              className={inputClass}
              type="number"
              min={0}
              value={form.minOrderAmount}
              onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.freeDelivery}
              onChange={(e) => setForm((f) => ({ ...f, freeDelivery: e.target.checked }))}
            />
            Free delivery
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.firstOrderOnly}
              onChange={(e) => setForm((f) => ({ ...f, firstOrderOnly: e.target.checked }))}
            />
            First order only
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.newUsersOnly}
              onChange={(e) => setForm((f) => ({ ...f, newUsersOnly: e.target.checked }))}
            />
            New users only
          </label>
          <div className="sm:col-span-2 lg:col-span-3">
            <button type="submit" className={btnPrimary} disabled={create.isPending}>
              Create coupon
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Offer</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Min order</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.isLoading ? (
              <AdminTableLoader colSpan={7} />
            ) : (
              list.data?.data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono font-semibold text-emerald-800">{row.code}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.title}</p>
                    {row.description ? (
                      <p className="text-xs text-slate-500">{row.description}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 capitalize">{row.type.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">₹{row.minOrderAmount}</td>
                  <td className="px-4 py-3">
                    {row.timesUsed}
                    {row.usageLimitTotal != null ? ` / ${row.usageLimitTotal}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        row.isActive ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {row.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-sm font-semibold text-emerald-800 hover:underline"
                      onClick={() => toggleActive.mutate(row)}
                    >
                      {row.isActive ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Demo codes seeded: URJA50, FIRST100, FREEDEL, FRUIT20 — test on the storefront cart.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 flex items-center gap-2 text-xl font-bold text-slate-900">
        {icon}
        {value}
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}
