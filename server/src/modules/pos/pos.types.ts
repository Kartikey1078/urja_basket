export type PosOrderStatus = "pending_payment" | "paid" | "cancelled" | "failed";
export type PosPaymentMethod = "cash" | "pine_card" | "pine_qr";
export type PosPaymentStatus = "pending" | "success" | "failed" | "cancelled";

export type PosCartLineInput = {
  productId: number;
  variantId?: number | null;
  quantity: number;
};

export type PosProductVariant = {
  id: number;
  weight: string;
  sku: string;
  price: number;
  stock: number;
};

export type PosProductSearchRow = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  productStock: number;
  variantCount: number;
  variants: PosProductVariant[];
};

export type PosOrderItemRow = {
  id: number;
  product_id: number;
  variant_id: number | null;
  product_name: string;
  variant_label: string | null;
  sku: string | null;
  unit_price: string;
  quantity: number;
  line_total: string;
};

export type PosPaymentRow = {
  id: number;
  method: PosPaymentMethod;
  status: PosPaymentStatus;
  amount: string;
  cash_received: string | null;
  cash_change: string | null;
  created_at: Date;
  completed_at: Date | null;
};

export type PosOrderRow = {
  id: number;
  order_number: string;
  status: PosOrderStatus;
  subtotal: string;
  discount: string;
  tax: string;
  grand_total: string;
  cashier_admin_user_id: number | null;
  notes: string | null;
  created_at: Date;
  paid_at: Date | null;
  cancelled_at: Date | null;
};

export type PosOrderDetail = {
  order: PosOrderRow;
  items: PosOrderItemRow[];
  payment: PosPaymentRow | null;
};
