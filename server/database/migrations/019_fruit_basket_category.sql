-- Fruit Basket category for curated gift baskets / hampers.

INSERT INTO categories (name, slug, image)
SELECT 'Fruit Basket', 'fruit-basket', '/fruits/category-fruits.png'
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE slug = 'fruit-basket'
);
