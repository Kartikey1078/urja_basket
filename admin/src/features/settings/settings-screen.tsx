"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { AdminPageLoader } from "@/components/loader";
import { adminFetchJson } from "@/lib/api-client";
import { adminToast, formatAdminError } from "@/lib/admin-toast";
import type { SiteSettings } from "@/lib/types";

const inputClass =
  "mt-1 block w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25";
const btnPrimary =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";

function toFormState(s: SiteSettings): Record<string, string | boolean> {
  return {
    storeName: s.storeName,
    storeTagline: s.storeTagline,
    supportEmail: s.supportEmail ?? "",
    supportPhone: s.supportPhone ?? "",
    freeDeliveryMin: String(s.freeDeliveryMin),
    deliveryFee: String(s.deliveryFee),
    platformFee: String(s.platformFee),
    cartPromoDiscount: String(s.cartPromoDiscount),
    taxRate: String(s.taxRate),
    lowStockThreshold: String(s.lowStockThreshold),
    expressDeliveryMinutes: String(s.expressDeliveryMinutes),
    codEnabled: s.codEnabled,
    onlinePaymentEnabled: s.onlinePaymentEnabled,
    maintenanceMode: s.maintenanceMode,
  };
}

function patchFromForm(form: Record<string, string | boolean>): Record<string, unknown> {
  return {
    storeName: String(form.storeName).trim(),
    storeTagline: String(form.storeTagline).trim(),
    supportEmail: String(form.supportEmail).trim() || null,
    supportPhone: String(form.supportPhone).trim() || null,
    freeDeliveryMin: Number(form.freeDeliveryMin),
    deliveryFee: Number(form.deliveryFee),
    platformFee: Number(form.platformFee),
    cartPromoDiscount: Number(form.cartPromoDiscount),
    taxRate: Number(form.taxRate),
    lowStockThreshold: Number(form.lowStockThreshold),
    expressDeliveryMinutes: Number(form.expressDeliveryMinutes),
    codEnabled: Boolean(form.codEnabled),
    onlinePaymentEnabled: Boolean(form.onlinePaymentEnabled),
    maintenanceMode: Boolean(form.maintenanceMode),
  };
}

export function SettingsScreen() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, string | boolean> | null>(null);

  const settings = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => adminFetchJson<{ data: SiteSettings }>("settings").then((r) => r.data),
  });

  useEffect(() => {
    if (settings.data && form === null) {
      setForm(toFormState(settings.data));
    }
  }, [settings.data, form]);

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      adminFetchJson<{ data: SiteSettings }>("settings", { method: "PATCH", json: body }),
    onSuccess: (res) => {
      adminToast.saved("Settings");
      setForm(toFormState(res.data));
      void qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      void qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
    },
    onError: (e) => adminToast.fromError(e, "Could not save settings"),
  });

  if (settings.isLoading || !form) {
    return <AdminPageLoader label="Loading settings…" />;
  }

  if (settings.isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
        {formatAdminError(settings.error)}
      </div>
    );
  }

  const setField = (key: string, value: string | boolean) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Store identity, pricing, payments, and operations. Changes apply to cart totals and checkout on the storefront."
      />

      {settings.data?.updatedAt ? (
        <p className="mb-4 text-xs text-slate-500">
          Last updated {new Date(settings.data.updatedAt).toLocaleString()}
        </p>
      ) : null}

      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(patchFromForm(form));
        }}
      >
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">Store</h2>
          <p className="mt-1 text-xs text-slate-500">Branding shown to customers and in admin headers.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Store name
              <input
                className={inputClass}
                value={String(form.storeName)}
                onChange={(e) => setField("storeName", e.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Tagline
              <input
                className={inputClass}
                value={String(form.storeTagline)}
                onChange={(e) => setField("storeTagline", e.target.value)}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Support email
              <input
                className={inputClass}
                type="email"
                value={String(form.supportEmail)}
                onChange={(e) => setField("supportEmail", e.target.value)}
                placeholder="help@urjabasket.com"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Support phone
              <input
                className={inputClass}
                value={String(form.supportPhone)}
                onChange={(e) => setField("supportPhone", e.target.value)}
                placeholder="+91 …"
              />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">Pricing &amp; fees</h2>
          <p className="mt-1 text-xs text-slate-500">
            Used when calculating cart and order totals (free delivery above minimum subtotal).
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-sm font-medium text-slate-700">
              Free delivery min (₹)
              <input
                className={inputClass}
                type="number"
                min={0}
                step="1"
                value={String(form.freeDeliveryMin)}
                onChange={(e) => setField("freeDeliveryMin", e.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Delivery fee (₹)
              <input
                className={inputClass}
                type="number"
                min={0}
                step="0.01"
                value={String(form.deliveryFee)}
                onChange={(e) => setField("deliveryFee", e.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Platform / packaging fee (₹)
              <input
                className={inputClass}
                type="number"
                min={0}
                step="0.01"
                value={String(form.platformFee)}
                onChange={(e) => setField("platformFee", e.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Cart promo discount (₹)
              <input
                className={inputClass}
                type="number"
                min={0}
                step="0.01"
                value={String(form.cartPromoDiscount)}
                onChange={(e) => setField("cartPromoDiscount", e.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Tax rate (0–1)
              <input
                className={inputClass}
                type="number"
                min={0}
                max={1}
                step="0.0001"
                value={String(form.taxRate)}
                onChange={(e) => setField("taxRate", e.target.value)}
                required
              />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">Payments</h2>
          <p className="mt-1 text-xs text-slate-500">At least one method must stay enabled for checkout.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-8">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="size-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                checked={Boolean(form.codEnabled)}
                onChange={(e) => setField("codEnabled", e.target.checked)}
              />
              Cash on delivery (COD)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="size-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                checked={Boolean(form.onlinePaymentEnabled)}
                onChange={(e) => setField("onlinePaymentEnabled", e.target.checked)}
              />
              Online (Razorpay)
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">Operations</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Low stock threshold (units)
              <input
                className={inputClass}
                type="number"
                min={1}
                max={9999}
                value={String(form.lowStockThreshold)}
                onChange={(e) => setField("lowStockThreshold", e.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Express delivery estimate (minutes)
              <input
                className={inputClass}
                type="number"
                min={5}
                max={240}
                value={String(form.expressDeliveryMinutes)}
                onChange={(e) => setField("expressDeliveryMinutes", e.target.value)}
                required
              />
            </label>
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
            <input
              type="checkbox"
              className="mt-0.5 size-4 rounded border-amber-300 text-amber-700 focus:ring-amber-600"
              checked={Boolean(form.maintenanceMode)}
              onChange={(e) => setField("maintenanceMode", e.target.checked)}
            />
            <span>
              <strong>Maintenance mode</strong> — blocks new checkouts on the storefront with a friendly
              message.
            </span>
          </label>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className={btnPrimary} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save settings"}
          </button>
          <button
            type="button"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
            onClick={() => {
              if (settings.data) {
                setForm(toFormState(settings.data));
                adminToast.info("Changes reset to last saved values.");
              }
            }}
          >
            Reset changes
          </button>
        </div>
      </form>
    </div>
  );
}
