-- Sample rows for local / Postman testing (optional — run after 001).

INSERT INTO categories (id, name, slug, image) VALUES
  (1, 'Fresh Fruits', 'fresh-fruits', 'https://example.com/cdn/categories/fresh-fruits.jpg'),
  (2, 'Dry Fruits', 'dry-fruits', 'https://example.com/cdn/categories/dry-fruits.jpg');

INSERT INTO products (
  id, name, slug, short_description, full_description, category_id, main_image,
  stock, average_rating, total_reviews, is_featured, is_best_seller, is_organic
) VALUES
  (
    1,
    'Alphonso Mango',
    'alphonso-mango',
    'Sweet Ratnagiri Alphonso — limited season.',
    'Premium Alphonso mangoes sourced from Ratnagiri. Rich aroma, smooth pulp, ideal for gifting and desserts.',
    1,
    'https://example.com/cdn/products/alphonso-mango.jpg',
    120,
    4.70,
    34,
    1,
    1,
    1
  ),
  (
    2,
    'California Almonds',
    'california-almonds',
    'Crunchy whole almonds, vacuum packed.',
    'Lightly roasted California almonds. High in protein and healthy fats. Perfect for snacking and baking.',
    2,
    'https://example.com/cdn/products/california-almonds.jpg',
    500,
    4.50,
    12,
    0,
    1,
    0
  );

INSERT INTO product_variants (product_id, weight, price, original_price, discount_percentage, stock, sku) VALUES
  (1, '250g',  149.00, 179.00, 16.76, 40, 'MANGO-ALPH-250'),
  (1, '500g',  279.00, 329.00, 15.20, 35, 'MANGO-ALPH-500'),
  (1, '1kg',   529.00, 599.00, 11.69, 25, 'MANGO-ALPH-1KG'),
  (2, '250g',  199.00, 219.00,  9.13, 200, 'ALM-CAL-250'),
  (2, '500g',  379.00, 419.00,  9.55, 180, 'ALM-CAL-500'),
  (2, '1kg',   719.00, 799.00, 10.01, 120, 'ALM-CAL-1KG');

INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
  (1001, 1, 5, 'Best mangoes I have ordered online. Will buy again.'),
  (1002, 1, 4, 'Very sweet; one piece was slightly bruised.'),
  (1003, 2, 5, 'Fresh crunch, good packaging.'),
  (1004, 2, 4, 'Tasty but slightly salty for my preference.');
