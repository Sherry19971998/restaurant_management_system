INSERT INTO restaurants (name, address, phone)
VALUES ('Campus Diner', '1 University Ave', '555-0100');

INSERT INTO dining_tables (table_number, capacity, status, restaurant_id)
VALUES
  ('T1', 4, 'AVAILABLE', 1),
  ('T2', 2, 'AVAILABLE', 1),
  ('T3', 6, 'RESERVED', 1);

INSERT INTO menu_items (name, description, price, available, restaurant_id)
VALUES
  ('Margherita Pizza', 'Tomato, basil, mozzarella', 12.50, TRUE, 1),
  ('Caesar Salad', 'Romaine, parmesan, croutons', 8.00, TRUE, 1),
  ('Iced Tea', 'Fresh brewed', 3.00, TRUE, 1);

INSERT INTO customers (name, phone, email)
VALUES
  ('Alex Chen', '555-0111', 'alex@example.com'),
  ('Mina Park', '555-0222', 'mina@example.com');

INSERT INTO reservations (reservation_time, party_size, status, dining_table_id, customer_id)
VALUES
  ('2026-02-16 18:00:00', 2, 'CONFIRMED', 2, 1),
  ('2026-02-16 19:30:00', 4, 'REQUESTED', 3, 2);

INSERT INTO orders (status, created_at, updated_at, dining_table_id, customer_id)
VALUES
  ('PLACED', '2026-02-16 18:10:00', '2026-02-16 18:10:00', 1, 1);

INSERT INTO order_items (quantity, price_at_order, note, order_id, menu_item_id)
VALUES
  (2, 12.50, 'No onions', 1, 1),
  (1, 3.00, NULL, 1, 3);
