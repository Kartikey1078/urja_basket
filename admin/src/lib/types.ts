export type AdminUserRole = "owner" | "manager" | "staff";

export type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: AdminUserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SiteSettings = {
  storeName: string;
  storeTagline: string;
  supportEmail: string | null;
  supportPhone: string | null;
  freeDeliveryMin: number;
  deliveryFee: number;
  platformFee: number;
  cartPromoDiscount: number;
  taxRate: number;
  lowStockThreshold: number;
  expressDeliveryMinutes: number;
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  maintenanceMode: boolean;
  updatedAt: string | null;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  created_at: string;
  updated_at: string;
};

export type NutritionTagCatalog = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PaginatedMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ProductListRow = {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  category_id: number;
  category_name: string;
  category_slug: string;
  main_image: string | null;
  stock: number;
  average_rating: string;
  total_reviews: number;
  is_featured: number;
  is_best_seller: number;
  is_organic: number;
  nutrition_tags: string[];
  created_at: string;
  updated_at: string;
};

export type ProductDetail = {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  category_id: number;
  main_image: string | null;
  stock: number;
  average_rating: string;
  total_reviews: number;
  is_featured: number;
  is_best_seller: number;
  is_organic: number;
  nutrition_tags: string[];
  created_at: string;
  updated_at: string;
};

export type ProductVariant = {
  id: number;
  product_id: number;
  weight: string;
  price: number;
  original_price: number | null;
  discount_percentage: number;
  stock: number;
  sku: string;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "paid"
  | "failed"
  | "cancelled";
export type PaymentMethod = "online" | "cod";
export type FulfillmentStatus =
  | "order_placed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "created" | "paid" | "failed" | "pending_collection" | "refunded";

export type AdminOrderListRow = {
  id: number;
  order_number: string;
  user_id: number | null;
  status: OrderStatus;
  fulfillment_status: FulfillmentStatus;
  payment_method: PaymentMethod;
  delivery_slot: string | null;
  grand_total: string;
  amount_paise: number;
  customer_name: string;
  customer_phone: string;
  razorpay_order_id: string | null;
  paid_at: string | null;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
  user_clerk_id: string | null;
  payment_status: PaymentStatus | null;
  razorpay_payment_id: string | null;
};

export type AdminOrderItem = {
  id: number;
  order_id: number;
  product_id: number | null;
  product_slug: string;
  product_name: string;
  product_subtitle: string | null;
  product_image: string | null;
  unit_price: string;
  mrp: string;
  quantity: number;
  line_total: string;
};

export type AdminOrderDetail = {
  order: {
    id: number;
    order_number: string;
    user_id: number | null;
    status: OrderStatus;
    payment_method: PaymentMethod;
    fulfillment_status: FulfillmentStatus;
    delivery_slot: string | null;
    subtotal: string;
    delivery_fee: string;
    platform_fee: string;
    discount: string;
    tax: string;
    grand_total: string;
    amount_paise: number;
    customer_name: string;
    customer_phone: string;
    address_snapshot: {
      fullName: string;
      phoneNumber: string;
      formatted: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    razorpay_order_id: string | null;
    razorpay_receipt: string | null;
    paid_at: string | null;
    inventory_deducted_at: string | null;
    created_at: string;
  };
  items: AdminOrderItem[];
  payment: {
    id: number;
    status: PaymentStatus;
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
    amount_paise: number;
    paid_at: string | null;
  } | null;
  user: {
    id: number;
    clerk_id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

export type AdminPaymentListRow = {
  id: number;
  order_id: number;
  order_number: string;
  order_status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  user_id: number | null;
  user_email: string | null;
  provider: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount_paise: number;
  currency: string;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
};

export type AdminCustomerListRow = {
  id: number;
  clerk_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  created_at: string;
  order_count: number;
  paid_order_count: number;
  total_spent: string;
  last_order_at: string | null;
};

export type AdminCustomerDetail = {
  user: {
    id: number;
    clerk_id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    image: string | null;
    created_at: string;
  };
  orders: AdminOrderListRow[];
};

export type AnalyticsOverview = {
  revenue: { total: string; today: string; week: string; month: string };
  orders: {
    total: number;
    paid: number;
    pending_payment: number;
    failed: number;
    cancelled: number;
    today: number;
    week: number;
  };
  payments: { total: number; paid: number; created: number; failed: number };
  customers: { total: number; with_orders: number };
  catalog: {
    products: number;
    categories: number;
    low_stock_products: number;
    out_of_stock_products: number;
  };
  revenueByDay: { date: string; revenue: string; order_count: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: {
    product_slug: string;
    product_name: string;
    units_sold: number;
    revenue: string;
  }[];
  recentOrders: {
    id: number;
    order_number: string;
    customer_name: string;
    grand_total: string;
    status: string;
    created_at: string;
  }[];
};

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type InventorySummary = {
  total_products: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
};

export type InventoryListRow = {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  product_stock: number;
  variant_count: number;
  variant_stock_total: number;
  effective_stock: number;
  stock_status: StockStatus;
  is_featured: number;
  is_best_seller: number;
  updated_at: string;
};

export type InventoryVariantRow = {
  id: number;
  product_id: number;
  weight: string;
  sku: string;
  stock: number;
  price: string;
};
