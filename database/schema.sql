DROP TABLE IF EXISTS stock_transactions;
DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  low_stock_threshold INTEGER NOT NULL CHECK (low_stock_threshold >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_transactions (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
