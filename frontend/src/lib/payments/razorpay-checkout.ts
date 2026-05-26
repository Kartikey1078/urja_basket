const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise: Promise<void> | null = null;

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay runs in the browser only"));
  }
  if (window.Razorpay) {
    return Promise.resolve();
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export function getRazorpayKeyId(): string {
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!key) {
    throw new Error("Razorpay key is not configured");
  }
  return key;
}

export type OpenRazorpayInput = {
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId?: string;
  name?: string;
  email?: string;
  phone?: string;
  description?: string;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onDismiss?: () => void;
  onFailed?: (message: string) => void;
};

export async function openRazorpayCheckout(input: OpenRazorpayInput): Promise<void> {
  await loadRazorpayScript();
  const RazorpayCtor = window.Razorpay;
  if (!RazorpayCtor) {
    throw new Error("Razorpay SDK unavailable");
  }

  const key = input.keyId ?? getRazorpayKeyId();

  const rzp = new RazorpayCtor({
    key,
    amount: input.amountPaise,
    currency: input.currency,
    name: "Urja Basket",
    description: input.description ?? "Grocery order",
    order_id: input.orderId,
    prefill: {
      name: input.name,
      email: input.email,
      contact: input.phone,
    },
    theme: { color: "#1B4332" },
    handler: input.onSuccess,
    modal: {
      ondismiss: input.onDismiss,
    },
  });

  rzp.on("payment.failed", (res) => {
    input.onFailed?.(res.error?.description ?? "Payment failed");
  });

  rzp.open();
}
