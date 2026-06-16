-- Coupon & offer system (idempotent)
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS coupons (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL,
  title VARCHAR(120) NOT NULL,
  description TEXT NULL,
  type ENUM(
    'percentage',
    'flat',
    'free_delivery',
    'first_order',
    'flash_sale',
    'referral',
    'cashback',
    'buy_x_get_y',
    'cart_value'
  ) NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  max_discount DECIMAL(12, 2) NULL,
  min_order_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  free_delivery TINYINT(1) NOT NULL DEFAULT 0,
  usage_limit_total INT UNSIGNED NULL,
  usage_limit_per_user INT UNSIGNED NOT NULL DEFAULT 1,
  times_used INT UNSIGNED NOT NULL DEFAULT 0,
  new_users_only TINYINT(1) NOT NULL DEFAULT 0,
  first_order_only TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  rules_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_coupons_code (code),
  KEY idx_coupons_active (is_active, starts_at, ends_at),
  KEY idx_coupons_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  coupon_id INT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED NOT NULL,
  user_id INT NULL,
  discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  customer_phone VARCHAR(20) NULL,
  device_fingerprint VARCHAR(128) NULL,
  ip_address VARCHAR(45) NULL,
  status ENUM('pending', 'confirmed', 'rolled_back') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_redemptions_coupon (coupon_id),
  KEY idx_redemptions_user (user_id),
  KEY idx_redemptions_order (order_id),
  KEY idx_redemptions_phone (customer_phone),
  CONSTRAINT fk_redemptions_coupon
    FOREIGN KEY (coupon_id) REFERENCES coupons (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_redemptions_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_redemptions_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupon_abuse_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT NULL,
  coupon_id INT UNSIGNED NULL,
  code VARCHAR(64) NULL,
  reason VARCHAR(64) NOT NULL,
  detail TEXT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(512) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_abuse_created (created_at),
  KEY idx_abuse_user (user_id),
  KEY idx_abuse_coupon (coupon_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @has_cart_coupon := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'carts' AND COLUMN_NAME = 'applied_coupon_id'
);

SET @sql_cart_coupon := IF(
  @has_cart_coupon = 0,
  "ALTER TABLE carts
    ADD COLUMN applied_coupon_id INT UNSIGNED NULL AFTER user_id,
    ADD COLUMN applied_coupon_code VARCHAR(64) NULL AFTER applied_coupon_id,
    ADD COLUMN coupon_locked_until DATETIME NULL AFTER applied_coupon_code,
    ADD KEY idx_carts_applied_coupon (applied_coupon_id)",
  "SELECT 1"
);
PREPARE stmt FROM @sql_cart_coupon;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_order_coupon := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'coupon_id'
);

SET @sql_order_coupon := IF(
  @has_order_coupon = 0,
  "ALTER TABLE orders
    ADD COLUMN coupon_id INT UNSIGNED NULL AFTER user_id,
    ADD COLUMN coupon_code VARCHAR(64) NULL AFTER coupon_id,
    ADD COLUMN coupon_discount DECIMAL(12, 2) NOT NULL DEFAULT 0 AFTER discount,
    ADD KEY idx_orders_coupon (coupon_id)",
  "SELECT 1"
);
PREPARE stmt2 FROM @sql_order_coupon;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

INSERT IGNORE INTO coupons (
  code, title, description, type, discount_value, max_discount, min_order_amount,
  free_delivery, usage_limit_total, usage_limit_per_user, first_order_only, is_active, starts_at, ends_at
) VALUES
  ('URJA50', '₹50 off', 'Flat ₹50 off on fresh fruits', 'flat', 50, NULL, 199, 0, 10000, 3, 0, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)),
  ('FIRST100', 'First order ₹100 off', 'Welcome offer for your first order', 'first_order', 100, 100, 299, 0, NULL, 1, 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)),
  ('FREEDEL', 'Free delivery', 'Zero delivery fee on this order', 'free_delivery', 0, NULL, 149, 1, NULL, 5, 0, 1, NOW(), DATE_ADD(NOW(), INTERVAL 6 MONTH)),
  ('FRUIT20', '20% off fruits', 'Save 20% up to ₹120', 'percentage', 20, 120, 249, 0, 5000, 2, 0, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR));
