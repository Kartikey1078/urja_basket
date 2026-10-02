-- Gift Hamper category for curated gifting products.

INSERT INTO categories (name, slug, image)
SELECT 'Gift Hamper', 'gift-hampers', '/home/gifthampers.png'
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE slug = 'gift-hampers'
);

UPDATE categories
SET image = '/home/gifthampers.png', name = 'Gift Hamper'
WHERE slug = 'gift-hampers';
