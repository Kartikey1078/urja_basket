-- Nutrition tag catalog (name, image) for storefront filters (idempotent)
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS nutrition_tag_catalog (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(128) NOT NULL,
  slug VARCHAR(128) NOT NULL,
  image_url VARCHAR(512) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_nutrition_tag_catalog_name (name),
  UNIQUE KEY uk_nutrition_tag_catalog_slug (slug),
  KEY idx_nutrition_tag_catalog_sort (sort_order, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
