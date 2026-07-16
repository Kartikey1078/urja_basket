"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Phone, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { OrderTrackingTimeline } from "@/components/orders/order-tracking-timeline";
import { UrjaLoader } from "@/components/ui/loader";
import { clearActiveOrder } from "@/lib/orders/active-order";
import { fetchOrderTracking } from "@/lib/orders/api";
import { getLastOrder } from "@/lib/orders/last-order";

function formatEta(minutes: number | null) {
  if (minutes == null) return null;
  if (minutes <= 1) return "Arriving soon";
  return `${minutes} min`;
}

function partnerTelHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `tel:+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `tel:+${digits}`;
  return `tel:${digits}`;
}

function formatPartnerPhone(phone: string) {
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return phone;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

function OrderTrackingInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = Number(params.id);
  const queryClient = useQueryClient();
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const lastOrder = useMemo(() => getLastOrder(), []);
  const guestPhone =
    !isSignedIn && lastOrder?.orderId === orderId ? lastOrder.phone : undefined;
  const [manualRefreshing, setManualRefreshing] = useState(false);

  useEffect(() => {
    if (searchParams.get("placed") === "1") {
      toast.success("Order confirmed", {
        description: "We're preparing your delivery",
      });
      window.history.replaceState({}, "", `/orders/track/${orderId}`);
    }
  }, [searchParams, orderId]);

  const trackingQueryKey = useMemo(
    () => ["order-tracking", orderId, isSignedIn, guestPhone] as const,
    [orderId, isSignedIn, guestPhone]
  );

  const tracking = useQuery({
    queryKey: trackingQueryKey,
    queryFn: async () => {
      const token = isSignedIn ? await getToken() : null;
      return fetchOrderTracking(orderId, { token, phone: guestPhone });
    },
    enabled: isLoaded && Number.isInteger(orderId) && orderId > 0,
    staleTime: 0,
    structuralSharing: false,
    refetchInterval: (query) => (query.state.data?.isActive ? 5000 : false),
  });

  useEffect(() => {
    const status = tracking.data?.fulfillmentStatus;
    if (status === "delivered" || status === "cancelled") {
      clearActiveOrder();
    }
  }, [tracking.data?.fulfillmentStatus]);

  const handleRefresh = useCallback(async () => {
    setManualRefreshing(true);
    try {
      const token = isSignedIn ? await getToken() : null;
      const data = await fetchOrderTracking(orderId, {
        token,
        phone: guestPhone,
        bustCache: true,
      });
      queryClient.setQueryData(trackingQueryKey, data);
      toast.success("Status updated", { duration: 1500 });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not refresh");
    } finally {
      setManualRefreshing(false);
    }
  }, [
    orderId,
    isSignedIn,
    guestPhone,
    getToken,
    queryClient,
    trackingQueryKey,
  ]);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return <p className="px-4 py-8 text-sm text-red-700">Invalid order.</p>;
  }

  if (!isLoaded || tracking.isLoading) {
    return (
      <div className="bg-urja-cream flex min-h-dvh items-center justify-center">
        <p className="text-sm text-slate-600">Loading live tracking…</p>
      </div>
    );
  }

  if (tracking.isError || !tracking.data) {
    return (
      <div className="bg-urja-cream min-h-dvh px-4 py-8">
        <p className="text-sm text-red-700">
          {tracking.error instanceof Error ? tracking.error.message : "Could not load tracking"}
        </p>
        <Link href="/" className="text-urja-forest mt-4 inline-block text-sm font-semibold underline">
          Back to home
        </Link>
      </div>
    );
  }

  const t = tracking.data;
  const eta = formatEta(t.etaMinutes);
  const delivered = t.fulfillmentStatus === "delivered";

  return (
    <div className="bg-urja-cream min-h-dvh pb-8">
      <header className="bg-urja-forest text-urja-cream sticky top-0 z-20 px-4 py-4 shadow-md">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Link
            href={isSignedIn ? "/orders" : "/"}
            className="flex size-10 items-center justify-center rounded-full bg-white/10"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium opacity-80">Order {t.orderNumber}</p>
            <h1 className="truncate text-lg font-bold">
              {delivered ? "Delivered" : eta ? `Arriving in ${eta}` : "Tracking order"}
            </h1>
          </div>
          {t.isActive ? (
            <button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={manualRefreshing || tracking.isFetching}
              className="flex size-10 items-center justify-center rounded-full bg-white/10 disabled:opacity-60"
              aria-label="Refresh"
            >
              {manualRefreshing || tracking.isFetching ? (
                <UrjaLoader size="xs" variant="light" srLabel="Refreshing" />
              ) : (
                <RefreshCw className="size-5" />
              )}
            </button>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-4 px-4 py-4">
        {!delivered && t.isActive ? (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm"
          >
            <div className="bg-urja-forest/8 relative h-36">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <span className="bg-urja-forest absolute -inset-3 animate-ping rounded-full opacity-20" />
                  <span className="bg-urja-forest relative flex size-14 items-center justify-center rounded-full text-urja-cream shadow-lg">
                    <MapPin className="size-7" />
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground absolute bottom-2 left-0 right-0 text-center text-xs">
                Live updates every few seconds
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-urja-forest text-sm font-bold">{t.addressPreview}</p>
              <p className="text-muted-foreground text-xs">{t.city}</p>
            </div>
          </motion.section>
        ) : null}

        {t.partner && t.fulfillmentStatus === "out_for_delivery" ? (
          <section className="rounded-2xl border border-urja-forest/15 bg-white p-4 shadow-sm">
            <p className="text-muted-foreground text-xs font-semibold uppercase">Delivery partner</p>
            <p className="text-urja-forest mt-1 text-base font-bold">{t.partner.name}</p>
            <a
              href={partnerTelHref(t.partner.phone)}
              className="bg-urja-forest/8 text-urja-forest mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold active:scale-[0.98]"
              aria-label={`Call ${t.partner.name} at ${formatPartnerPhone(t.partner.phone)}`}
            >
              <Phone className="size-4" />
              {formatPartnerPhone(t.partner.phone)}
            </a>
          </section>
        ) : null}

        {t.codAmountDue != null && !delivered ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <strong>Pay on delivery:</strong> ₹{t.codAmountDue.toFixed(2)} — keep exact change handy if
            possible.
          </section>
        ) : null}

        <section className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
          <h2 className="text-urja-forest mb-4 text-sm font-bold">Order status</h2>
          <OrderTrackingTimeline steps={t.steps} />
        </section>

        <section className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
          <h2 className="text-urja-forest mb-3 text-sm font-bold">
            {t.itemCount} item{t.itemCount === 1 ? "" : "s"}
          </h2>
          <ul className="space-y-2">
            {t.itemsPreview.map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-black/[0.04]">
                  {item.image ? (
                    <Image src={item.image} alt="" fill className="object-cover" sizes="48px" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                  <p className="text-muted-foreground text-xs">Qty {item.quantity}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-urja-forest mt-3 text-right text-sm font-bold">
            Total ₹{t.grandTotal.toFixed(2)}
          </p>
        </section>

        {delivered ? (
          <Link
            href="/categories"
            className="bg-urja-forest text-urja-cream flex w-full items-center justify-center rounded-2xl py-3.5 text-sm font-bold shadow-md"
          >
            Order again
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function OrderTrackingScreen() {
  return (
    <Suspense fallback={<div className="bg-urja-cream flex min-h-dvh items-center justify-center text-sm text-slate-600">Loading…</div>}>
      <OrderTrackingInner />
    </Suspense>
  );
}
