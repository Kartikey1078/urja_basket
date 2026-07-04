"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Minus, Plus, Receipt, Search, ShoppingCart, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AdminApiError, adminFetchJson } from "@/lib/api-client";
import { adminToast } from "@/lib/admin-toast";
import { cn } from "@/lib/cn";
import { usePosCartStore, type PosCartLine } from "@/stores/pos-cart-store";

type PosVariant = {
  id: number;
  weight: string;
  sku: string;
  price: number;
  stock: number;
};

type PosProduct = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  productStock: number;
  variantCount: number;
  variants: PosVariant[];
};

function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function stockBadge(stock: number) {
  if (stock <= 0) return { label: "Out", className: "bg-red-100 text-red-800" };
  if (stock <= 10) return { label: `${stock} left`, className: "bg-amber-100 text-amber-900" };
  return { label: `${stock} in stock`, className: "bg-emerald-100 text-emerald-800" };
}

export function PosBillingScreen() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [variantPick, setVariantPick] = useState<PosProduct | null>(null);
  const [cashOpen, setCashOpen] = useState(false);
  const [received, setReceived] = useState("");

  const lines = usePosCartStore((s) => s.lines);
  const addLine = usePosCartStore((s) => s.addLine);
  const setQuantity = usePosCartStore((s) => s.setQuantity);
  const removeLine = usePosCartStore((s) => s.removeLine);
  const clear = usePosCartStore((s) => s.clear);
  const grandTotal = usePosCartStore((s) => s.grandTotal);
  const toPayload = usePosCartStore((s) => s.toPayload);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 200);
    return () => window.clearTimeout(t);
  }, [query]);

  const products = useQuery({
    queryKey: ["admin", "pos", "search", debounced],
    queryFn: () =>
      adminFetchJson<{ data: PosProduct[] }>(
        `pos/products/search?q=${encodeURIComponent(debounced)}`
      ).then((r) => r.data),
    enabled: debounced.length >= 1,
  });

  const checkout = useMutation({
    mutationFn: (receivedAmount: number) =>
      adminFetchJson<{
        data: {
          orderNumber: string;
          grandTotal: number;
          cashChange: number;
        };
      }>("pos/orders/checkout/cash", {
        method: "POST",
        json: { items: toPayload(), receivedAmount },
      }).then((r) => r.data),
    onSuccess: (data) => {
      adminToast.success(
        `Sale complete · ${data.orderNumber} · Change ${formatInr(data.cashChange)}`
      );
      clear();
      setCashOpen(false);
      setReceived("");
    },
    onError: (e) =>
      adminToast.error(e instanceof AdminApiError ? e.message : "Checkout failed"),
  });

  const total = grandTotal();
  const receivedNum = Number(received);
  const change =
    Number.isFinite(receivedNum) && receivedNum >= total
      ? Math.round((receivedNum - total) * 100) / 100
      : null;

  const addProduct = useCallback(
    (product: PosProduct, variant?: PosVariant) => {
      if (product.variants.length > 0 && !variant) {
        setVariantPick(product);
        return;
      }
      const v = variant ?? product.variants[0];
      const stock = v ? v.stock : product.productStock;
      const unitPrice = v ? v.price : 0;
      if (stock <= 0) {
        adminToast.error("Out of stock");
        return;
      }
      addLine({
        productId: product.id,
        variantId: v?.id ?? null,
        name: product.name,
        variantLabel: v?.weight ?? null,
        sku: v?.sku ?? null,
        image: product.image,
        unitPrice,
        stock,
      });
      setVariantPick(null);
    },
    [addLine]
  );

  return (
    <div className="-mx-3 flex min-h-[calc(100dvh-8rem)] flex-col bg-white sm:-mx-4 lg:-mx-6 lg:min-h-[calc(100dvh-6rem)]">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
        <div>
          <h1 className="text-lg font-bold text-slate-900">POS Billing</h1>
          <p className="text-xs text-slate-500">Walk-in sales · synced with online inventory</p>
        </div>
        <Link
          href="/pos/orders"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Receipt className="size-4" aria-hidden />
          POS orders
        </Link>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Products */}
        <section className="flex min-h-0 flex-1 flex-col border-b border-slate-200 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-100 p-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                className="block w-full min-h-12 rounded-xl border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
                placeholder="Search name, SKU, or scan barcode…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {debounced.length < 1 ? (
              <p className="py-12 text-center text-sm text-slate-500">Type to search products</p>
            ) : products.isFetching ? (
              <p className="py-12 text-center text-sm text-slate-500">Searching…</p>
            ) : products.data?.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500">No products found</p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {products.data?.map((p) => {
                  const topVariant = p.variants[0];
                  const stock = p.variants.length ? p.variants.reduce((s, v) => s + v.stock, 0) : p.productStock;
                  const price = topVariant?.price ?? 0;
                  const badge = stockBadge(stock);
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        disabled={stock <= 0}
                        onClick={() => addProduct(p)}
                        className={cn(
                          "flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-blue-300 hover:shadow-md disabled:opacity-50",
                          stock <= 0 && "cursor-not-allowed"
                        )}
                      >
                        <div className="relative aspect-square bg-slate-100">
                          {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image} alt="" className="size-full object-cover" />
                          ) : (
                            <div className="flex size-full items-center justify-center text-xs text-slate-400">
                              No image
                            </div>
                          )}
                          <span
                            className={cn(
                              "absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                              badge.className
                            )}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col gap-1 p-2.5">
                          <p className="line-clamp-2 text-sm font-semibold text-slate-900">{p.name}</p>
                          <p className="text-sm font-bold text-blue-700">{formatInr(price)}</p>
                          {p.variants.length > 1 ? (
                            <p className="text-[10px] text-slate-500">{p.variants.length} variants</p>
                          ) : topVariant ? (
                            <p className="text-[10px] text-slate-500">{topVariant.weight}</p>
                          ) : null}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* Cart */}
        <aside className="flex w-full shrink-0 flex-col bg-slate-50 lg:w-[min(24rem,36vw)]">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <ShoppingCart className="size-4" aria-hidden />
              Cart ({lines.length})
            </h2>
            {lines.length > 0 ? (
              <button
                type="button"
                onClick={() => clear()}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Clear all
              </button>
            ) : null}
          </div>

          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
            {lines.length === 0 ? (
              <li className="py-8 text-center text-sm text-slate-500">Cart is empty</li>
            ) : (
              lines.map((line) => (
                <CartLineRow
                  key={line.key}
                  line={line}
                  onQty={(q) => setQuantity(line.key, q)}
                  onRemove={() => removeLine(line.key)}
                />
              ))
            )}
          </ul>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-sm font-medium text-slate-600">Total</span>
              <span className="text-2xl font-bold text-slate-900">{formatInr(total)}</span>
            </div>
            <button
              type="button"
              disabled={lines.length === 0 || checkout.isPending}
              onClick={() => {
                setReceived(total > 0 ? String(Math.ceil(total)) : "");
                setCashOpen(true);
              }}
              className="flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-base font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {checkout.isPending ? "Processing…" : "Cash checkout"}
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-500">
              Card & QR (Pine Labs) — Phase 2
            </p>
          </div>
        </aside>
      </div>

      {variantPick ? (
        <VariantPicker
          product={variantPick}
          onSelect={(v) => addProduct(variantPick, v)}
          onClose={() => setVariantPick(null)}
        />
      ) : null}

      {cashOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Cash payment</h3>
              <button type="button" onClick={() => setCashOpen(false)} aria-label="Close">
                <X className="size-5 text-slate-500" />
              </button>
            </div>
            <p className="mb-1 text-sm text-slate-600">Amount due</p>
            <p className="mb-4 text-2xl font-bold text-slate-900">{formatInr(total)}</p>
            <label className="block text-sm font-medium text-slate-700">
              Cash received
              <input
                type="number"
                min={0}
                step="0.01"
                className="mt-1 block w-full min-h-12 rounded-xl border border-slate-300 px-3 text-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
                value={received}
                onChange={(e) => setReceived(e.target.value)}
                autoFocus
              />
            </label>
            {change != null ? (
              <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                Change: {formatInr(change)}
              </p>
            ) : received ? (
              <p className="mt-3 text-sm text-red-600">Amount is less than total</p>
            ) : null}
            <button
              type="button"
              disabled={checkout.isPending || change == null}
              onClick={() => checkout.mutate(receivedNum)}
              className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Complete sale
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CartLineRow({
  line,
  onQty,
  onRemove,
}: {
  line: PosCartLine;
  onQty: (q: number) => void;
  onRemove: () => void;
}) {
  const lineTotal = line.unitPrice * line.quantity;
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{line.name}</p>
          {line.variantLabel ? (
            <p className="text-xs text-slate-500">{line.variantLabel}</p>
          ) : null}
          <p className="mt-1 text-xs text-slate-600">
            {formatInr(line.unitPrice)} × {line.quantity} ={" "}
            <span className="font-semibold">{formatInr(lineTotal)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-lg p-2 text-red-600 hover:bg-red-50"
          aria-label="Remove"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onQty(line.quantity - 1)}
          className="flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50"
        >
          <Minus className="size-4" />
        </button>
        <span className="min-w-[2rem] text-center text-sm font-bold">{line.quantity}</span>
        <button
          type="button"
          onClick={() => onQty(line.quantity + 1)}
          disabled={line.quantity >= line.stock}
          className="flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 disabled:opacity-40"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </li>
  );
}

function VariantPicker({
  product,
  onSelect,
  onClose,
}: {
  product: PosProduct;
  onSelect: (v: PosVariant) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
      <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">{product.name}</h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <ul className="space-y-2">
          {product.variants.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                disabled={v.stock <= 0}
                onClick={() => onSelect(v)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left hover:border-blue-400 disabled:opacity-50"
              >
                <span>
                  <span className="block font-semibold">{v.weight}</span>
                  <span className="text-xs text-slate-500">{v.sku}</span>
                </span>
                <span className="text-right">
                  <span className="block font-bold text-blue-700">{formatInr(v.price)}</span>
                  <span className="text-xs text-slate-500">{v.stock} left</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
