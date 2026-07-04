-- POS walk-in sales (shares products / product_variants stock with online store)

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS pos_orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_number VARCHAR(32) NOT NULL,
  status ENUM('pending_payment', 'paid', 'cancelled', 'failed') NOT NULL DEFAULT 'pending_payment',
  subtotal DECIMAL(12, 2) NOT NULL,
  discount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(12, 2) NOT NULL DEFAULT 0,
  grand_total DECIMAL(12, 2) NOT NULL,
  cashier_admin_user_id INT UNSIGNED NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pos_orders_order_number (order_number),
  KEY idx_pos_orders_status (status),
  KEY idx_pos_orders_created (created_at),
  CONSTRAINT fk_pos_orders_cashier
    FOREIGN KEY (cashier_admin_user_id) REFERENCES admin_users (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pos_order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pos_order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  variant_id BIGINT UNSIGNED NULL,
  product_name VARCHAR(255) NOT NULL,
  variant_label VARCHAR(64) NULL,
  sku VARCHAR(64) NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  line_total DECIMAL(12, 2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_pos_order_items_order (pos_order_id),
  KEY idx_pos_order_items_product (product_id),
  CONSTRAINT fk_pos_order_items_order
    FOREIGN KEY (pos_order_id) REFERENCES pos_orders (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_pos_order_items_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_pos_order_items_variant
    FOREIGN KEY (variant_id) REFERENCES product_variants (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT chk_pos_order_items_qty CHECK (quantity >= 1 AND quantity <= 999)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pos_payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pos_order_id BIGINT UNSIGNED NOT NULL,
  method ENUM('cash', 'pine_card', 'pine_qr') NOT NULL,
  status ENUM('pending', 'success', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  amount DECIMAL(12, 2) NOT NULL,
  cash_received DECIMAL(12, 2) NULL,
  cash_change DECIMAL(12, 2) NULL,
  pine_transaction_id VARCHAR(128) NULL,
  pine_rrn VARCHAR(64) NULL,
  pine_raw_response JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY idx_pos_payments_order (pos_order_id),
  CONSTRAINT fk_pos_payments_order
    FOREIGN KEY (pos_order_id) REFERENCES pos_orders (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_movements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  variant_id BIGINT UNSIGNED NULL,
  delta INT NOT NULL,
  reason ENUM(
    'pos_sale',
    'online_sale',
    'admin_adjustment',
    'pos_cancel_restore',
    'online_cancel_restore'
  ) NOT NULL,
  reference_type ENUM('pos_order', 'order', 'admin') NOT NULL,
  reference_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_inventory_movements_product (product_id),
  KEY idx_inventory_movements_ref (reference_type, reference_id),
  CONSTRAINT fk_inventory_movements_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_inventory_movements_variant
    FOREIGN KEY (variant_id) REFERENCES product_variants (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
