-- Store-wide configuration editable from the admin panel (single row, id = 1).

CREATE TABLE IF NOT EXISTS site_settings (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
  store_name VARCHAR(120) NOT NULL DEFAULT 'Urja Basket',
  store_tagline VARCHAR(255) NOT NULL DEFAULT 'Fresh groceries, delivered fast',
  support_email VARCHAR(255) NULL,
  support_phone VARCHAR(32) NULL,
  free_delivery_min DECIMAL(12, 2) NOT NULL DEFAULT 499.00,
  delivery_fee DECIMAL(12, 2) NOT NULL DEFAULT 40.00,
  platform_fee DECIMAL(12, 2) NOT NULL DEFAULT 10.00,
  cart_promo_discount DECIMAL(12, 2) NOT NULL DEFAULT 50.00,
  tax_rate DECIMAL(6, 4) NOT NULL DEFAULT 0.0000,
  low_stock_threshold INT UNSIGNED NOT NULL DEFAULT 10,
  express_delivery_minutes INT UNSIGNED NOT NULL DEFAULT 10,
  cod_enabled TINYINT(1) NOT NULL DEFAULT 1,
  online_payment_enabled TINYINT(1) NOT NULL DEFAULT 1,
  maintenance_mode TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_site_settings_singleton CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO site_settings (id)
VALUES (1)
ON DUPLICATE KEY UPDATE id = id;
