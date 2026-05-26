-- Order fulfillment tracking (idempotent)
SET NAMES utf8mb4;

SET @has_fs := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'fulfillment_status'
);

SET @sql_fs = IF(
  @has_fs = 0,
  "ALTER TABLE orders
    ADD COLUMN fulfillment_status ENUM(
      'order_placed',
      'preparing',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ) NOT NULL DEFAULT 'order_placed' AFTER payment_method,
    ADD COLUMN estimated_delivery_at TIMESTAMP NULL AFTER paid_at,
    ADD COLUMN delivered_at TIMESTAMP NULL AFTER estimated_delivery_at,
    ADD KEY idx_orders_fulfillment_status (fulfillment_status)",
  "SELECT 1"
);
PREPARE stmt_fs FROM @sql_fs;
EXECUTE stmt_fs;
DEALLOCATE PREPARE stmt_fs;
