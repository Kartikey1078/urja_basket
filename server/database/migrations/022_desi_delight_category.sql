-- Desi Delight category (mukhwas, traditional mouth fresheners & snacks).

INSERT INTO categories (name, slug, image)
SELECT 'Desi Delight', 'desi-delight', '/homepagecategory/desidelight.png'
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE slug = 'desi-delight'
);
