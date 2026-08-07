-- Soft-archive products instead of hard delete (preserves orders, POS, inventory history).

SET NAMES utf8mb4;

ALTER TABLE products
  ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER is_organic,
  ADD COLUMN archived_stock_snapshot JSON NULL COMMENT 'Stock levels before archive; used on restore',
  ADD KEY idx_products_is_active (is_active);
