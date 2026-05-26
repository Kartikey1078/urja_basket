import type { PricingConfig, SiteSettings } from "./settings.types";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  storeName: "Urja Basket",
  storeTagline: "Fresh groceries, delivered fast",
  supportEmail: null,
  supportPhone: null,
  freeDeliveryMin: 499,
  deliveryFee: 40,
  platformFee: 10,
  cartPromoDiscount: 50,
  taxRate: 0,
  lowStockThreshold: 10,
  expressDeliveryMinutes: 10,
  codEnabled: true,
  onlinePaymentEnabled: true,
  maintenanceMode: false,
  updatedAt: null,
};

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  freeDeliveryMin: DEFAULT_SITE_SETTINGS.freeDeliveryMin,
  deliveryFee: DEFAULT_SITE_SETTINGS.deliveryFee,
  platformFee: DEFAULT_SITE_SETTINGS.platformFee,
  cartPromoDiscount: DEFAULT_SITE_SETTINGS.cartPromoDiscount,
  taxRate: DEFAULT_SITE_SETTINGS.taxRate,
};
