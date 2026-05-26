-- Cash on Delivery (idempotent — safe to re-run)
SET NAMES utf8mb4;

SET @has_payment_method := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'payment_method'
);

SET @sql_pm = IF(
  @has_payment_method = 0,
  "ALTER TABLE orders ADD COLUMN payment_method ENUM('online', 'cod') NOT NULL DEFAULT 'online' AFTER status",
  "SELECT 1"
);
PREPARE stmt_pm FROM @sql_pm;
EXECUTE stmt_pm;
DEALLOCATE PREPARE stmt_pm;

ALTER TABLE orders
  MODIFY COLUMN status ENUM(
    'pending_payment',
    'confirmed',
    'paid',
    'failed',
    'cancelled'
  ) NOT NULL DEFAULT 'pending_payment';

ALTER TABLE payments
  MODIFY COLUMN razorpay_order_id VARCHAR(64) NULL;

SET @pay_status := (
  SELECT COLUMN_TYPE FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'status'
);

SET @sql_ps = IF(
  @pay_status NOT LIKE '%pending_collection%',
  "ALTER TABLE payments MODIFY COLUMN status ENUM('created', 'paid', 'failed', 'pending_collection') NOT NULL DEFAULT 'created'",
  "SELECT 1"
);
PREPARE stmt_ps FROM @sql_ps;
EXECUTE stmt_ps;
DEALLOCATE PREPARE stmt_ps;
