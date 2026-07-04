-- Payment refunded status (idempotent — safe to re-run)
SET NAMES utf8mb4;

SET @pay_status := (
  SELECT COLUMN_TYPE FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'status'
);

SET @sql_ps = IF(
  @pay_status NOT LIKE '%refunded%',
  "ALTER TABLE payments MODIFY COLUMN status ENUM('created', 'paid', 'failed', 'pending_collection', 'refunded') NOT NULL DEFAULT 'created'",
  "SELECT 1"
);
PREPARE stmt_ps FROM @sql_ps;
EXECUTE stmt_ps;
DEALLOCATE PREPARE stmt_ps;
