import type { RowDataPacket } from "mysql2";

import { pool } from "../../../database/pool";
import { DEFAULT_SITE_SETTINGS } from "../settings.defaults";
import type { SiteSettings, SiteSettingsPatch } from "../settings.types";

type SettingsRow = RowDataPacket & {
  store_name: string;
  store_tagline: string;
  support_email: string | null;
  support_phone: string | null;
  free_delivery_min: string;
  delivery_fee: string;
  platform_fee: string;
  cart_promo_discount: string;
  tax_rate: string;
  low_stock_threshold: number;
  express_delivery_minutes: number;
  cod_enabled: number;
  online_payment_enabled: number;
  maintenance_mode: number;
  updated_at: Date | null;
};

function rowToSettings(row: SettingsRow): SiteSettings {
  return {
    storeName: row.store_name,
    storeTagline: row.store_tagline,
    supportEmail: row.support_email,
    supportPhone: row.support_phone,
    freeDeliveryMin: Number(row.free_delivery_min),
    deliveryFee: Number(row.delivery_fee),
    platformFee: Number(row.platform_fee),
    cartPromoDiscount: Number(row.cart_promo_discount),
    taxRate: Number(row.tax_rate),
    lowStockThreshold: row.low_stock_threshold,
    expressDeliveryMinutes: row.express_delivery_minutes,
    codEnabled: Boolean(row.cod_enabled),
    onlinePaymentEnabled: Boolean(row.online_payment_enabled),
    maintenanceMode: Boolean(row.maintenance_mode),
    updatedAt: row.updated_at ? row.updated_at.toISOString() : null,
  };
}

export async function findSiteSettings(): Promise<SiteSettings | null> {
  const [rows] = await pool.query<SettingsRow[]>(
    `SELECT store_name, store_tagline, support_email, support_phone,
            free_delivery_min, delivery_fee, platform_fee, cart_promo_discount,
            tax_rate, low_stock_threshold, express_delivery_minutes,
            cod_enabled, online_payment_enabled, maintenance_mode, updated_at
     FROM site_settings
     WHERE id = 1
     LIMIT 1`
  );
  return rows[0] ? rowToSettings(rows[0]) : null;
}

export async function ensureSiteSettingsRow(): Promise<void> {
  await pool.query(
    `INSERT INTO site_settings (id) VALUES (1)
     ON DUPLICATE KEY UPDATE id = id`
  );
}

export async function updateSiteSettings(patch: SiteSettingsPatch): Promise<SiteSettings> {
  const sets: string[] = [];
  const params: unknown[] = [];

  if (patch.storeName !== undefined) {
    sets.push("store_name = ?");
    params.push(patch.storeName);
  }
  if (patch.storeTagline !== undefined) {
    sets.push("store_tagline = ?");
    params.push(patch.storeTagline);
  }
  if (patch.supportEmail !== undefined) {
    sets.push("support_email = ?");
    params.push(patch.supportEmail);
  }
  if (patch.supportPhone !== undefined) {
    sets.push("support_phone = ?");
    params.push(patch.supportPhone);
  }
  if (patch.freeDeliveryMin !== undefined) {
    sets.push("free_delivery_min = ?");
    params.push(patch.freeDeliveryMin);
  }
  if (patch.deliveryFee !== undefined) {
    sets.push("delivery_fee = ?");
    params.push(patch.deliveryFee);
  }
  if (patch.platformFee !== undefined) {
    sets.push("platform_fee = ?");
    params.push(patch.platformFee);
  }
  if (patch.cartPromoDiscount !== undefined) {
    sets.push("cart_promo_discount = ?");
    params.push(patch.cartPromoDiscount);
  }
  if (patch.taxRate !== undefined) {
    sets.push("tax_rate = ?");
    params.push(patch.taxRate);
  }
  if (patch.lowStockThreshold !== undefined) {
    sets.push("low_stock_threshold = ?");
    params.push(patch.lowStockThreshold);
  }
  if (patch.expressDeliveryMinutes !== undefined) {
    sets.push("express_delivery_minutes = ?");
    params.push(patch.expressDeliveryMinutes);
  }
  if (patch.codEnabled !== undefined) {
    sets.push("cod_enabled = ?");
    params.push(patch.codEnabled ? 1 : 0);
  }
  if (patch.onlinePaymentEnabled !== undefined) {
    sets.push("online_payment_enabled = ?");
    params.push(patch.onlinePaymentEnabled ? 1 : 0);
  }
  if (patch.maintenanceMode !== undefined) {
    sets.push("maintenance_mode = ?");
    params.push(patch.maintenanceMode ? 1 : 0);
  }

  if (sets.length === 0) {
    const current = await findSiteSettings();
    return current ?? DEFAULT_SITE_SETTINGS;
  }

  await pool.query(`UPDATE site_settings SET ${sets.join(", ")} WHERE id = 1`, params);
  const updated = await findSiteSettings();
  return updated ?? DEFAULT_SITE_SETTINGS;
}
