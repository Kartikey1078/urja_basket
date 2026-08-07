-- Track variant SKU on cart lines and order lines for multi-weight products.

SET NAMES utf8mb4;

ALTER TABLE cart_items
  ADD COLUMN variant_sku VARCHAR(64) NOT NULL DEFAULT '' AFTER product_id,
  ADD KEY idx_cart_items_variant_sku (variant_sku);

ALTER TABLE cart_items
  DROP INDEX uk_cart_items_cart_product,
  ADD UNIQUE KEY uk_cart_items_cart_line (cart_id, product_id, variant_sku);

ALTER TABLE order_items
  ADD COLUMN variant_sku VARCHAR(64) NULL AFTER product_id,
  ADD KEY idx_order_items_variant_sku (variant_sku);
