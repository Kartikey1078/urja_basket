"use client";

import { useAuth } from "@clerk/nextjs";
import { Check, ChevronDown, Sparkles, Tag, TicketPercent, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  applyBestCoupon,
  applyCouponToCart,
  fetchCouponOffers,
  previewCoupon,
  removeCartCoupon,
} from "@/lib/coupons/api";
import type { CouponOffer } from "@/lib/coupons/types";
import { CouponOfferCardSkeleton } from "@/components/cart/coupon-offer-card-skeleton";
import { UrjaLoader } from "@/components/ui/loader";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

import { cartCardClass } from "./cart-shell";

function OfferCard({
  offer,
  loading,
  itemTotal,
  onApply,
}: {
  offer: CouponOffer;
  loading: boolean;
  itemTotal: number;
  onApply: (code: string) => void;
}) {
  const locked = !offer.applicable;

  return (
    <li
      className={cn(
        "relative overflow-hidden rounded-xl ring-1 transition",
        locked
          ? "bg-stone-50 ring-stone-200/80"
          : "bg-white ring-urja-forest/20 hover:ring-urja-forest/35"
      )}
    >
      <div className="absolute left-0 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-50 ring-1 ring-stone-200/80" />
      <div className="absolute right-0 top-1/2 size-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-50 ring-1 ring-stone-200/80" />

      <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-lg bg-[#eef3ef] px-2 py-1 font-mono text-xs font-semibold tracking-wide text-urja-forest">
              {offer.code}
            </span>
            {offer.estimatedSavings > 0 && !locked ? (
              <span className="text-xs font-medium text-emerald-700">
                Save ~₹{offer.estimatedSavings.toFixed(0)}
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-sm font-medium text-stone-900">{offer.title}</p>
          {offer.description ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-stone-500">{offer.description}</p>
          ) : null}
          {locked && offer.amountToUnlock ? (
            <p className="mt-2 text-xs text-stone-600">
              Add <span className="font-semibold text-stone-800">₹{offer.amountToUnlock}</span> more
              <span className="text-stone-400"> · cart ₹{itemTotal.toFixed(0)}</span>
            </p>
          ) : null}
          {locked && !offer.amountToUnlock && offer.reason ? (
            <p className="mt-2 text-xs text-stone-500">{offer.reason}</p>
          ) : null}
        </div>

        {locked ? (
          <span className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-stone-100 px-4 text-xs font-medium text-stone-500 sm:w-auto sm:min-w-[5.5rem]">
            Locked
          </span>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={() => onApply(offer.code)}
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-urja-forest px-5 text-sm font-medium text-white transition hover:bg-urja-forest/90 disabled:opacity-60 sm:min-h-10 sm:w-auto sm:min-w-[6.5rem]"
          >
            {loading ? <UrjaLoader size="xs" srLabel="Applying coupon" /> : <Tag className="size-3.5" />}
            Apply
          </button>
        )}
      </div>
    </li>
  );
}

export function CartCouponSection() {
  const { isSignedIn, getToken } = useAuth();
  const items = useCartStore((s) => s.items);
  const bill = useCartStore((s) => s.bill);
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);
  const guestCouponCode = useCartStore((s) => s.guestCouponCode);
  const applyServerCart = useCartStore((s) => s.applyServerCart);
  const setGuestCouponCode = useCartStore((s) => s.setGuestCouponCode);
  const displayCoupon =
    appliedCoupon ??
    (guestCouponCode
      ? { code: guestCouponCode, title: guestCouponCode, couponDiscount: 0, freeDelivery: false }
      : null);

  const [code, setCode] = useState("");
  const [couponOpen, setCouponOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offers, setOffers] = useState<CouponOffer[]>([]);

  const itemTotal = bill?.itemTotal ?? items.reduce((s, i) => s + i.price * i.quantity, 0);
  const applicableCount = offers.filter((o) => o.applicable).length;

  const loadOffers = useCallback(async () => {
    if (items.length === 0) {
      setOffers([]);
      setOffersLoading(false);
      return;
    }
    setOffersLoading(true);
    try {
      const token = isSignedIn ? await getToken() : null;
      const data = await fetchCouponOffers(items, token);
      setOffers(data);
    } catch {
      setOffers([]);
    } finally {
      setOffersLoading(false);
    }
  }, [getToken, isSignedIn, items]);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  useEffect(() => {
    if (displayCoupon) {
      setCouponOpen(true);
    }
  }, [displayCoupon]);

  const couponSubtitle = displayCoupon
    ? displayCoupon.couponDiscount > 0
      ? `${displayCoupon.code} · You save ₹${displayCoupon.couponDiscount.toFixed(0)}${displayCoupon.freeDelivery ? " + free delivery included" : ""}`
      : `${displayCoupon.code} applied`
    : offersLoading
      ? "Loading offers…"
      : applicableCount > 0
        ? `${applicableCount} offer${applicableCount === 1 ? "" : "s"} ready to apply`
        : "Tap to enter a code or view offers";

  const handleApply = async (couponCode: string) => {
    const trimmed = couponCode.trim().toUpperCase();
    if (!trimmed) {
      toast.error("Enter a coupon code");
      return;
    }
    if (items.length === 0) {
      toast.error("Add items to your cart first");
      return;
    }

    setLoading(true);
    try {
      if (isSignedIn) {
        const token = await getToken();
        if (!token) throw new Error("Sign in required");
        const result = await applyCouponToCart(trimmed, token);
        applyServerCart(result.items, result.bill, result.coupon);
        toast.success(result.coupon?.title ?? "Coupon applied");
      } else {
        const token = await getToken();
        const preview = await previewCoupon(trimmed, items, token);
        setGuestCouponCode(trimmed);
        toast.success(preview.message);
      }
      setCode("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not apply coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      if (isSignedIn) {
        const token = await getToken();
        if (!token) return;
        const result = await removeCartCoupon(token);
        applyServerCart(result.items, result.bill, null);
      } else {
        setGuestCouponCode(null);
      }
      toast.success("Coupon removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not remove coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleBest = async () => {
    if (!isSignedIn) {
      toast.message("Sign in to auto-apply the best coupon");
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Sign in required");
      const result = await applyBestCoupon(token);
      applyServerCart(result.items, result.bill, result.coupon);
      toast.success("Best coupon applied", {
        description: result.coupon?.title,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No better coupon found");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleApply(code);
  };

  return (
    <section className={cartCardClass}>
      <button
        type="button"
        onClick={() => setCouponOpen((v) => !v)}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:min-h-11 sm:px-5"
        aria-expanded={couponOpen}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#eef3ef] text-urja-forest">
            <TicketPercent className="size-4" strokeWidth={2} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-stone-900">
              {displayCoupon ? `${displayCoupon.code} applied` : "Coupons & offers"}
            </span>
            <span className="block truncate text-xs text-stone-500">{couponSubtitle}</span>
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-stone-400 transition",
            couponOpen && "rotate-180"
          )}
        />
      </button>

      {couponOpen ? (
        <div className="space-y-4 border-t border-stone-100 p-4 sm:p-5">
        {displayCoupon ? (
          <div className="flex items-start gap-3 rounded-xl bg-[#eef3ef] p-3.5 ring-1 ring-urja-forest/15 sm:p-4">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-urja-forest text-white">
              <Check className="size-4" strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-stone-900">{displayCoupon.title}</p>
              <p className="mt-0.5 font-mono text-xs font-medium text-urja-forest">{displayCoupon.code}</p>
              {displayCoupon.couponDiscount > 0 || displayCoupon.freeDelivery ? (
                <p className="mt-1 text-xs font-medium text-emerald-700">
                  {displayCoupon.couponDiscount > 0
                    ? `You save ₹${displayCoupon.couponDiscount.toFixed(0)}`
                    : null}
                  {displayCoupon.couponDiscount > 0 && displayCoupon.freeDelivery ? " · " : null}
                  {displayCoupon.freeDelivery ? "Free delivery included" : null}
                </p>
              ) : (
                <p className="mt-1 text-xs text-stone-600">Applied to your order</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => void handleRemove()}
              disabled={loading}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-stone-500 transition hover:bg-white/80 hover:text-stone-800 disabled:opacity-60"
              aria-label="Remove coupon"
            >
              {loading ? <UrjaLoader size="xs" srLabel="Removing coupon" /> : <X className="size-4" />}
            </button>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-2">
          <label htmlFor="cart-coupon-code" className="sr-only">
            Coupon code
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <TicketPercent
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400"
                aria-hidden
              />
              <input
                id="cart-coupon-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Have a code? Type here"
                autoComplete="off"
                spellCheck={false}
                className="min-h-12 w-full rounded-xl border border-stone-200 bg-stone-50/50 py-3 pr-3 pl-10 font-mono text-base uppercase tracking-wide outline-none placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-stone-400 focus:border-urja-forest focus:bg-white focus:ring-2 focus:ring-urja-forest/15 sm:min-h-11 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-urja-forest px-6 text-sm font-semibold text-white transition hover:bg-urja-forest/90 disabled:opacity-50 sm:min-h-11 sm:w-auto"
            >
              {loading ? <UrjaLoader size="xs" srLabel="Applying coupon" /> : null}
              Apply code
            </button>
          </div>
          <p className="text-[11px] text-stone-400">Press Enter or tap Apply · codes are not case-sensitive</p>
        </form>

        {isSignedIn ? (
          <button
            type="button"
            disabled={loading || items.length === 0}
            onClick={() => void handleBest()}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-urja-forest/30 bg-[#eef3ef]/50 text-sm font-medium text-urja-forest transition hover:border-urja-forest/50 hover:bg-[#eef3ef] disabled:opacity-60"
          >
            {loading ? (
              <UrjaLoader size="xs" srLabel="Applying best coupon" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Apply best coupon automatically
          </button>
        ) : (
          <p className="rounded-xl bg-stone-50 px-3 py-2.5 text-center text-xs text-stone-500 ring-1 ring-stone-200/60">
            Sign in to unlock auto-apply and saved coupons
          </p>
        )}

        {offersLoading ? (
          <ul className="space-y-2.5" aria-busy="true" aria-label="Loading offers">
            {[1, 2].map((i) => (
              <CouponOfferCardSkeleton key={i} />
            ))}
          </ul>
        ) : offers.length > 0 ? (
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Available offers
            </p>
            <ul className="max-h-64 space-y-2.5 overflow-y-auto pr-0.5">
              {offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  loading={loading}
                  itemTotal={itemTotal}
                  onApply={(c) => void handleApply(c)}
                />
              ))}
            </ul>
          </div>
        ) : items.length > 0 ? (
          <p className="rounded-xl bg-stone-50 px-3 py-4 text-center text-sm text-stone-500 ring-1 ring-stone-200/60">
            No offers right now — try entering a code above
          </p>
        ) : null}
        </div>
      ) : null}
    </section>
  );
}
