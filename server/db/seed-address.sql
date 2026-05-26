-- Demo addresses (user_id = 1 from seed-cart.sql)
INSERT INTO users (id, clerk_id, name, email, phone)
VALUES (1, 'seed_demo_user', 'Demo Cart User', 'demo-cart@urjabasket.local', '9876543210')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO user_addresses (
  user_id, full_name, phone_number, alternate_phone,
  address_line_1, address_line_2, landmark,
  city, state, country, postal_code,
  latitude, longitude, address_type, is_default
) VALUES
(
  1, 'Kartikey Tyagi', '9876543210', NULL,
  'Flat 402, Floor 4', 'Green Park Society, Model Town',
  'Near Bus Stand',
  'Panipat', 'Haryana', 'India', '132103',
  29.3909, 76.9635, 'home', 1
),
(
  1, 'Kartikey Tyagi', '9876543210', '9123456789',
  'Office 12', 'Sector 29, MG Road',
  'Opposite Metro',
  'Gurgaon', 'Haryana', 'India', '122001',
  28.4595, 77.0266, 'work', 0
)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
