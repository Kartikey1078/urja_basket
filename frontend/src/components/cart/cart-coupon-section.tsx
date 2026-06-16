"use client";

import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles, TicketPercent, X } from "lucide-react";
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

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offers, setOffers] = useState<CouponOffer[]>([]);

  const itemTotal = bill?.itemTotal ?? items.reduce((s, i) => s + i.price * i.quantity, 0);

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
    if (open) void loadOffers();
  }, [open, loadOffers]);

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

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <span className="bg-urja-gold/25 text-urja-forest inline-flex size-9 items-center justify-center rounded-full">
            <TicketPercent className="size-4" strokeWidth={2} />
          </span>
          <span>
            <span className="text-urja-forest block text-sm font-bold">
              {displayCoupon ? `${displayCoupon.code} applied` : "Apply Coupon"}
            </span>
            <span className="text-muted-foreground text-xs">
              {displayCoupon
                ? displayCoupon.couponDiscount > 0
                  ? `You save ₹${displayCoupon.couponDiscount.toFixed(0)}${displayCoupon.freeDelivery ? " + free delivery" : ""}`
                  : "Applied at checkout"
                : "Save more with exciting offers"}
            </span>
          </span>
        </span>
        <ChevronDown
          className={`text-muted-foreground size-5 shrink-0 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="border-border/60 space-y-3 border-t px-4 pb-4 pt-3">
          {displayCoupon ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-urja-forest/8 flex items-center justify-between gap-2 rounded-xl px-3 py-2.5"
            >
              <div>
                <p className="text-urja-forest text-sm font-bold">{displayCoupon.title}</p>
                <p className="text-muted-foreground text-xs">{displayCoupon.code}</p>
              </div>
              <button
                type="button"
                onClick={() => void handleRemove()}
                disabled={loading}
                className="text-muted-foreground hover:text-urja-forest rounded-lg p-1 disabled:opacity-60"
                aria-label="Remove coupon"
              >
                {loading ? <UrjaLoader size="xs" srLabel="Removing coupon" /> : <X className="size-4" />}
              </button>
            </motion.div>
          ) : null}

          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="border-border/80 text-urja-forest min-h-11 flex-1 rounded-xl border bg-white px-3 text-sm uppercase outline-none focus:border-urja-forest focus:ring-2 focus:ring-urja-forest/20"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => void handleApply(code)}
              className="bg-urja-forest text-urja-cream inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold disabled:opacity-60"
            >
              {loading ? <UrjaLoader size="xs" srLabel="Applying coupon" /> : null}
              Apply
            </button>
          </div>

          {isSignedIn ? (
            <button
              type="button"
              disabled={loading || items.length === 0}
              onClick={() => void handleBest()}
              className="border-urja-forest/25 text-urja-forest hover:bg-urja-forest/5 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-bold disabled:opacity-60"
            >
              {loading ? (
                <UrjaLoader size="xs" srLabel="Applying best coupon" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Apply best coupon
            </button>
          ) : (
            <p className="text-muted-foreground text-xs">
              Sign in to save coupons on your account and unlock auto-apply.
            </p>
          )}

          {offersLoading ? (
            <ul className="max-h-48 space-y-2 overflow-y-auto" aria-busy="true" aria-label="Loading offers">
              {[1, 2, 3].map((i) => (
                <CouponOfferCardSkeleton key={i} />
              ))}
            </ul>
          ) : offers.length > 0 ? (
            <ul className="max-h-48 space-y-2 overflow-y-auto">
              {offers.map((offer) => (
                <li
                  key={offer.id}
                  className="rounded-xl border border-black/[0.06] bg-slate-50/80 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-urja-forest text-sm font-bold">{offer.title}</p>
                      <p className="text-muted-foreground text-xs">{offer.code}</p>
                      {offer.description ? (
                        <p className="text-muted-foreground mt-0.5 text-xs">{offer.description}</p>
                      ) : null}
                    </div>
                    {offer.applicable ? (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => void handleApply(offer.code)}
                        className="bg-urja-forest text-urja-cream inline-flex shrink-0 items-center justify-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold disabled:opacity-60"
                      >
                        {loading ? <UrjaLoader size="xs" srLabel="Applying coupon" /> : null}
                        Apply
                      </button>
                    ) : (
                      <span className="text-muted-foreground shrink-0 text-[10px] font-semibold uppercase">
                        {offer.amountToUnlock
                          ? `+₹${offer.amountToUnlock}`
                          : offer.reason ?? "N/A"}
                      </span>
                    )}
                  </div>
                  {offer.amountToUnlock && !offer.applicable ? (
                    <p className="text-urja-forest mt-2 text-xs font-medium">
                      Add ₹{offer.amountToUnlock} more to unlock (cart ₹{itemTotal.toFixed(0)})
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
