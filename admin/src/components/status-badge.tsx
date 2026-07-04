import { cn } from "@/lib/cn";

const fulfillmentStyles: Record<string, string> = {
  order_placed: "bg-amber-50 text-amber-900 border-amber-200",
  preparing: "bg-amber-50 text-amber-900 border-amber-200",
  out_for_delivery: "bg-amber-50 text-amber-900 border-amber-200",
  delivered: "bg-slate-100 text-slate-600 border-slate-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
};

export function FulfillmentStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
        fulfillmentStyles[status] ?? "bg-slate-100 text-slate-700 border-slate-200"
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function getOrderFulfillmentStatus(row: {
  fulfillment_status?: string | null;
}): string {
  return row.fulfillment_status ?? "order_placed";
}

/** Active orders still awaiting delivery (excludes cancelled/failed). */
export function isOrderPendingDelivery(row: {
  status: string;
  fulfillment_status?: string | null;
}): boolean {
  if (row.status === "cancelled" || row.status === "failed") return false;
  const fulfillment = getOrderFulfillmentStatus(row);
  return fulfillment !== "delivered" && fulfillment !== "cancelled";
}

export function pendingDeliveryRowClass(row: {
  status: string;
  fulfillment_status?: string | null;
}): string {
  if (!isOrderPendingDelivery(row)) {
    return "hover:bg-slate-50/80";
  }
  return "border-l-4 border-l-amber-400 bg-amber-50/60 hover:bg-amber-50/80";
}

const orderStyles: Record<string, string> = {
  pending_payment: "bg-amber-50 text-amber-900 border-amber-200",
  confirmed: "bg-sky-50 text-sky-900 border-sky-200",
  paid: "bg-emerald-50 text-emerald-900 border-emerald-200",
  failed: "bg-red-50 text-red-900 border-red-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
};

const paymentStyles: Record<string, string> = {
  created: "bg-amber-50 text-amber-900 border-amber-200",
  pending_collection: "bg-sky-50 text-sky-900 border-sky-200",
  paid: "bg-emerald-50 text-emerald-900 border-emerald-200",
  failed: "bg-red-50 text-red-900 border-red-200",
  refunded: "bg-violet-50 text-violet-900 border-violet-200",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
        orderStyles[status] ?? "bg-slate-100 text-slate-700 border-slate-200"
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
        paymentStyles[status] ?? "bg-slate-100 text-slate-700 border-slate-200"
      )}
    >
      {status}
    </span>
  );
}

function formatInr(amount: string | number, paise?: number) {
  if (paise != null) return `₹${(paise / 100).toFixed(2)}`;
  const n = Number(amount);
  return `₹${Number.isFinite(n) ? n.toFixed(2) : amount}`;
}

export function formatMoney(amount: string | number, paise?: number) {
  return formatInr(amount, paise);
}

export function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}
