import { getApiBaseUrl } from "@/lib/api";
import type { DeliveryAddress } from "@/lib/address/types";

export type CheckoutAddressPayload = {
  addressId?: number | null;
  fullName: string;
  phoneNumber: string;
  alternatePhone?: string | null;
  formatted: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  addressType?: string;
};

export type PaymentMethod = "online" | "cod";

export type CreatePaymentOrderInput = {
  amountPaise: number;
  deliverySlot?: string;
  address: CheckoutAddressPayload;
  items?: { productSlug: string; quantity: number }[];
  paymentMethod?: PaymentMethod;
};

export type CodOrderResponse = {
  paymentMethod: "cod";
  dbOrderId: number;
  orderNumber: string;
  status: string;
  grandTotal: number;
  amountPaise: number;
  message: string;
};

export type CheckoutPlaceResponse = RazorpayOrderResponse | CodOrderResponse;

export function isCodOrderResponse(data: CheckoutPlaceResponse): data is CodOrderResponse {
  return "paymentMethod" in data && data.paymentMethod === "cod";
}

export type RazorpayOrderResponse = {
  razorpayOrderId: string;
  amount: number;
  amountPaise: number;
  currency: string;
  keyId: string;
  receipt: string;
  order: {
    dbOrderId: number;
    orderNumber: string;
    status: string;
    grandTotal: number;
    amountPaise: number;
  };
};

export type PaymentVerifiedResponse = {
  verified: boolean;
  dbOrderId: number;
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  status: string;
};

async function paymentFetch<T>(
  path: string,
  init?: RequestInit & { token?: string | null }
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };
  if (init?.token) {
    headers.Authorization = `Bearer ${init.token}`;
  }

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const text = await res.text();
  let body: { data?: T; error?: string } = {};
  try {
    body = text ? (JSON.parse(text) as { data?: T; error?: string }) : {};
  } catch {
    if (text.includes("Cannot GET")) {
      throw new Error(
        "Payment API must be called with POST, not GET. Use Proceed to Payment on the cart page."
      );
    }
    throw new Error(text.slice(0, 200) || `Payment request failed (${res.status})`);
  }
  if (!res.ok) {
    throw new Error(body.error ?? `Payment request failed (${res.status})`);
  }
  if (!body.data) {
    throw new Error("Invalid payment response");
  }
  return body.data;
}

export function deliveryAddressToCheckoutPayload(
  address: DeliveryAddress
): CheckoutAddressPayload {
  return {
    addressId: address.id > 0 ? address.id : null,
    fullName: address.fullName,
    phoneNumber: address.phoneNumber,
    alternatePhone: address.alternatePhone,
    formatted: address.formatted,
    city: address.city,
    state: address.state,
    country: address.country,
    postalCode: address.postalCode,
    addressType: address.addressType,
  };
}

/** Places order — online opens Razorpay; COD confirms order for pay on delivery. */
export async function placeCheckoutOrder(
  input: CreatePaymentOrderInput,
  token?: string | null
): Promise<CheckoutPlaceResponse> {
  return paymentFetch<CheckoutPlaceResponse>("/api/v1/payments/razorpay/order", {
    method: "POST",
    body: JSON.stringify(input),
    token,
  });
}

/** @deprecated Use placeCheckoutOrder */
export async function createRazorpayOrder(
  input: CreatePaymentOrderInput,
  token?: string | null
): Promise<RazorpayOrderResponse> {
  const data = await placeCheckoutOrder({ ...input, paymentMethod: "online" }, token);
  if (isCodOrderResponse(data)) {
    throw new Error("Expected online payment");
  }
  return data;
}

export async function verifyRazorpayPayment(
  payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  },
  token?: string | null
): Promise<PaymentVerifiedResponse> {
  return paymentFetch<PaymentVerifiedResponse>("/api/v1/payments/razorpay/verify", {
    method: "POST",
    body: JSON.stringify({
      razorpayOrderId: payload.razorpayOrderId,
      razorpayPaymentId: payload.razorpayPaymentId,
      razorpaySignature: payload.razorpaySignature,
    }),
    token,
  });
}
