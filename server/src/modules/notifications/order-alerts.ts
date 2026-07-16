import type { AdminOrderEvent } from "../../realtime/admin-notify";
import { env } from "../../config/env";
import { sendTelegramMessage } from "./telegram.service";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function adminOrderLink(orderId: number): string | null {
  const base = env.telegram.adminPublicUrl?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/orders/${orderId}`;
}

function formatMoney(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

function formatOrderTime(date: Date): string {
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDeliveryAddress(addr: {
  formatted: string;
  city?: string;
  postalCode?: string;
}): string {
  const line = addr.formatted.trim();
  const cityPin = [addr.city?.trim(), addr.postalCode?.trim()].filter(Boolean).join(" ");
  if (!cityPin) return line;
  if (line.toLowerCase().includes(cityPin.toLowerCase())) return line;
  return line ? `${line}, ${cityPin}` : cityPin;
}

export function telegramDetailsFromAddress(addr: {
  fullName: string;
  phoneNumber: string;
  alternatePhone?: string | null;
  formatted: string;
  city?: string;
  postalCode?: string;
}) {
  return {
    customerName: addr.fullName,
    customerPhone: addr.phoneNumber,
    alternatePhone: addr.alternatePhone,
    deliveryAddress: formatDeliveryAddress(addr),
  };
}

export type TelegramOrderLineItem = {
  name: string;
  weight?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type TelegramOrderDetails = {
  customerName?: string;
  customerPhone?: string;
  alternatePhone?: string | null;
  deliveryAddress?: string;
  orderedAt?: Date;
  items?: TelegramOrderLineItem[];
  subtotal?: number;
  grandTotal?: number;
  paymentMethod?: "cod" | "online";
};

function formatItemLines(items: TelegramOrderLineItem[]): string[] {
  if (items.length === 0) return [];

  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const header = [`<b>Items (${totalQty}):</b>`];

  const lines = items.map((item, index) => {
    const name = escapeHtml(item.name);
    const weight = item.weight?.trim() ? ` (${escapeHtml(item.weight.trim())})` : "";
    return (
      `${index + 1}. ${name}${weight}\n` +
      `   Qty: ${item.quantity} × ${formatMoney(item.unitPrice)} = <b>${formatMoney(item.lineTotal)}</b>`
    );
  });

  return [...header, ...lines];
}

function buildOrderMessage(
  title: string,
  event: AdminOrderEvent,
  details?: TelegramOrderDetails
): string {
  const orderNumber = escapeHtml(event.orderNumber ?? `#${event.orderId}`);
  const link = adminOrderLink(event.orderId);
  const linkLine = link ? `\n<a href="${escapeHtml(link)}">View in admin</a>` : "";

  const lines = [
    title,
    `Order: <b>${orderNumber}</b>`,
    details?.orderedAt ? `Time: ${escapeHtml(formatOrderTime(details.orderedAt))}` : null,
    details?.customerName ? `Customer: ${escapeHtml(details.customerName)}` : null,
    details?.customerPhone ? `Phone: ${escapeHtml(details.customerPhone)}` : null,
    details?.alternatePhone?.trim()
      ? `Alt phone: ${escapeHtml(details.alternatePhone.trim())}`
      : null,
    details?.deliveryAddress ? `Address: ${escapeHtml(details.deliveryAddress)}` : null,
    "",
    ...(details?.items?.length ? formatItemLines(details.items) : []),
    details?.items?.length ? "" : null,
    details?.subtotal != null ? `Subtotal: ${formatMoney(details.subtotal)}` : null,
    details?.grandTotal != null ? `<b>Grand Total: ${formatMoney(details.grandTotal)}</b>` : null,
    `Payment: ${details?.paymentMethod === "online" ? "Online (Razorpay)" : "COD"}`,
    linkLine || null,
  ].filter((line) => line !== null);

  return lines.join("\n");
}

export function notifyTelegramOrder(event: AdminOrderEvent, details?: TelegramOrderDetails): void {
  if (!env.telegram.enabled) return;

  if (event.type === "order.created") {
    void sendTelegramMessage(
      buildOrderMessage("🛒 <b>New COD Order</b>", event, { ...details, paymentMethod: "cod" })
    );
    return;
  }

  if (event.type === "order.updated" && event.status === "paid") {
    void sendTelegramMessage(
      buildOrderMessage("💳 <b>Payment Received</b>", event, {
        ...details,
        paymentMethod: details?.paymentMethod ?? "online",
      })
    );
  }
}
