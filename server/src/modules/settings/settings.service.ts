import { HttpError } from "../../errors/httpError";
import { DEFAULT_PRICING_CONFIG, DEFAULT_SITE_SETTINGS } from "./settings.defaults";
import * as settingsRepo from "./repositories/settings.repository";
import type {
  PricingConfig,
  PublicSiteSettings,
  SiteSettings,
  SiteSettingsPatch,
} from "./settings.types";

let cached: SiteSettings | null = null;
let cachedAt = 0;
const CACHE_MS = 30_000;

export function invalidateSettingsCache(): void {
  cached = null;
  cachedAt = 0;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (cached && Date.now() - cachedAt < CACHE_MS) {
    return cached;
  }
  try {
    const row = await settingsRepo.findSiteSettings();
    if (row) {
      cached = row;
      cachedAt = Date.now();
      return row;
    }
  } catch (err) {
    const code = typeof err === "object" && err !== null ? (err as { code?: string }).code : undefined;
    if (code !== "ER_NO_SUCH_TABLE") {
      throw err;
    }
  }
  return DEFAULT_SITE_SETTINGS;
}

export async function getPricingConfig(): Promise<PricingConfig> {
  const s = await getSiteSettings();
  return {
    freeDeliveryMin: s.freeDeliveryMin,
    deliveryFee: s.deliveryFee,
    platformFee: s.platformFee,
    cartPromoDiscount: s.cartPromoDiscount,
    taxRate: s.taxRate,
  };
}

export function pricingConfigFromSettings(settings: SiteSettings): PricingConfig {
  return {
    freeDeliveryMin: settings.freeDeliveryMin,
    deliveryFee: settings.deliveryFee,
    platformFee: settings.platformFee,
    cartPromoDiscount: settings.cartPromoDiscount,
    taxRate: settings.taxRate,
  };
}

export function toPublicSettings(settings: SiteSettings): PublicSiteSettings {
  return {
    storeName: settings.storeName,
    storeTagline: settings.storeTagline,
    freeDeliveryMin: settings.freeDeliveryMin,
    deliveryFee: settings.deliveryFee,
    platformFee: settings.platformFee,
    cartPromoDiscount: settings.cartPromoDiscount,
    expressDeliveryMinutes: settings.expressDeliveryMinutes,
    codEnabled: settings.codEnabled,
    onlinePaymentEnabled: settings.onlinePaymentEnabled,
    maintenanceMode: settings.maintenanceMode,
  };
}

function clampMoney(n: number, label: string, max = 999_999): number {
  if (!Number.isFinite(n) || n < 0 || n > max) {
    throw new HttpError(400, `${label} must be between 0 and ${max}`);
  }
  return Math.round(n * 100) / 100;
}

function clampInt(n: number, label: string, min: number, max: number): number {
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new HttpError(400, `${label} must be an integer from ${min} to ${max}`);
  }
  return n;
}

export function validateSettingsPatch(body: Record<string, unknown>): SiteSettingsPatch {
  const patch: SiteSettingsPatch = {};

  if (body.storeName !== undefined) {
    const v = String(body.storeName).trim();
    if (!v || v.length > 120) throw new HttpError(400, "storeName is required (max 120 chars)");
    patch.storeName = v;
  }
  if (body.storeTagline !== undefined) {
    const v = String(body.storeTagline).trim();
    if (v.length > 255) throw new HttpError(400, "storeTagline max 255 chars");
    patch.storeTagline = v;
  }
  if (body.supportEmail !== undefined) {
    if (body.supportEmail === null || body.supportEmail === "") {
      patch.supportEmail = null;
    } else {
      const v = String(body.supportEmail).trim();
      if (v.length > 255) throw new HttpError(400, "supportEmail max 255 chars");
      patch.supportEmail = v;
    }
  }
  if (body.supportPhone !== undefined) {
    if (body.supportPhone === null || body.supportPhone === "") {
      patch.supportPhone = null;
    } else {
      const v = String(body.supportPhone).trim();
      if (v.length > 32) throw new HttpError(400, "supportPhone max 32 chars");
      patch.supportPhone = v;
    }
  }
  if (body.freeDeliveryMin !== undefined) {
    patch.freeDeliveryMin = clampMoney(Number(body.freeDeliveryMin), "freeDeliveryMin");
  }
  if (body.deliveryFee !== undefined) {
    patch.deliveryFee = clampMoney(Number(body.deliveryFee), "deliveryFee");
  }
  if (body.platformFee !== undefined) {
    patch.platformFee = clampMoney(Number(body.platformFee), "platformFee");
  }
  if (body.cartPromoDiscount !== undefined) {
    patch.cartPromoDiscount = clampMoney(Number(body.cartPromoDiscount), "cartPromoDiscount");
  }
  if (body.taxRate !== undefined) {
    const rate = Number(body.taxRate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
      throw new HttpError(400, "taxRate must be between 0 and 1");
    }
    patch.taxRate = Math.round(rate * 10_000) / 10_000;
  }
  if (body.lowStockThreshold !== undefined) {
    patch.lowStockThreshold = clampInt(Number(body.lowStockThreshold), "lowStockThreshold", 1, 9999);
  }
  if (body.expressDeliveryMinutes !== undefined) {
    patch.expressDeliveryMinutes = clampInt(
      Number(body.expressDeliveryMinutes),
      "expressDeliveryMinutes",
      5,
      240
    );
  }
  if (body.codEnabled !== undefined) patch.codEnabled = Boolean(body.codEnabled);
  if (body.onlinePaymentEnabled !== undefined) {
    patch.onlinePaymentEnabled = Boolean(body.onlinePaymentEnabled);
  }
  if (body.maintenanceMode !== undefined) patch.maintenanceMode = Boolean(body.maintenanceMode);

  if (Object.keys(patch).length === 0) {
    throw new HttpError(400, "No valid settings fields to update");
  }

  return patch;
}

export async function updateSiteSettings(body: Record<string, unknown>): Promise<SiteSettings> {
  const patch = validateSettingsPatch(body);

  if (patch.codEnabled === false && patch.onlinePaymentEnabled === false) {
    throw new HttpError(400, "At least one payment method must stay enabled");
  }

  const current = await getSiteSettings();
  const nextCod = patch.codEnabled ?? current.codEnabled;
  const nextOnline = patch.onlinePaymentEnabled ?? current.onlinePaymentEnabled;
  if (!nextCod && !nextOnline) {
    throw new HttpError(400, "At least one payment method must stay enabled");
  }

  try {
    await settingsRepo.ensureSiteSettingsRow();
    const updated = await settingsRepo.updateSiteSettings(patch);
    invalidateSettingsCache();
    return updated;
  } catch (err) {
    const code = typeof err === "object" && err !== null ? (err as { code?: string }).code : undefined;
    if (code === "ER_NO_SUCH_TABLE") {
      throw new HttpError(
        503,
        "Settings table missing. Run npm run db:migrate in the server folder."
      );
    }
    throw err;
  }
}

export { DEFAULT_PRICING_CONFIG };
