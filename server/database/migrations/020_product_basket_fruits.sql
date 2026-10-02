-- Fruit Basket products: list of included fruit names (JSON array, max 12 in app layer).

ALTER TABLE products
  ADD COLUMN basket_fruits JSON NULL AFTER nutrition_tags;
