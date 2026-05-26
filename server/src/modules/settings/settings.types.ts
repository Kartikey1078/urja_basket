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

export type PublicSiteSettings = Pick<
  SiteSettings,
  | "storeName"
  | "storeTagline"
  | "freeDeliveryMin"
  | "deliveryFee"
  | "platformFee"
  | "cartPromoDiscount"
  | "expressDeliveryMinutes"
  | "codEnabled"
  | "onlinePaymentEnabled"
  | "maintenanceMode"
>;

export type PricingConfig = Pick<
  SiteSettings,
  "freeDeliveryMin" | "deliveryFee" | "platformFee" | "cartPromoDiscount" | "taxRate"
>;

export type SiteSettingsPatch = Partial<SiteSettings>;
