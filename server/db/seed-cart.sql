-- Demo cart for local testing (requires users id=1 and catalog seed)

INSERT INTO users (id, clerk_id, name, email)
VALUES (1, 'seed_demo_user', 'Demo Cart User', 'demo-cart@urjabasket.local')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO carts (id, user_id)
VALUES (1, 1)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

INSERT INTO cart_items (cart_id, product_id, quantity)
VALUES
  (1, 1, 1),
  (1, 2, 2)
ON DUPLICATE KEY UPDATE
  quantity = VALUES(quantity),
  updated_at = CURRENT_TIMESTAMP;
