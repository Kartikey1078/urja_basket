-- Product nutrition tags for catalog filtering (idempotent)
SET NAMES utf8mb4;

SET @has_nutrition_tags := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'nutrition_tags'
);

SET @sql_nutrition_tags = IF(
  @has_nutrition_tags = 0,
  "ALTER TABLE products
    ADD COLUMN nutrition_tags JSON NULL COMMENT 'Array of nutrition attribute labels' AFTER is_organic",
  "SELECT 1"
);
PREPARE stmt_nutrition_tags FROM @sql_nutrition_tags;
EXECUTE stmt_nutrition_tags;
DEALLOCATE PREPARE stmt_nutrition_tags;
