-- Order inventory tracking (idempotent — safe to re-run)
SET NAMES utf8mb4;

SET @has_inventory_deducted := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'inventory_deducted_at'
);

SET @sql_inv = IF(
  @has_inventory_deducted = 0,
  "ALTER TABLE orders ADD COLUMN inventory_deducted_at TIMESTAMP NULL DEFAULT NULL AFTER delivered_at",
  "SELECT 1"
);
PREPARE stmt_inv FROM @sql_inv;
EXECUTE stmt_inv;
DEALLOCATE PREPARE stmt_inv;
