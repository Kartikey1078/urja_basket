import type { PricingConfig, SiteSettings } from "./settings.types";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  storeName: "Urja Basket",
  storeTagline: "Fresh groceries, delivered fast",
  supportEmail: null,
  supportPhone: null,
  freeDeliveryMin: 0,
  deliveryFee: 0,
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
  taxRate: DEFAULT_SITE_SETTINGS.taxRate,
};
