-- schema.sql
-- Run this ENTIRE script in: Cloudflare Dashboard > D1 > zanny-db > Console > Execute
-- WARNING: This drops all existing data and recreates the tables fresh.

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS verification_codes;
DROP TABLE IF EXISTS sessions;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  salt TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT DEFAULT 'customer',
  is_verified INTEGER DEFAULT 0,
  auth_provider TEXT DEFAULT 'local', -- 'local' or 'google'
  login_count INTEGER DEFAULT 0,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE verification_codes (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  original_price REAL,
  discount_label TEXT,
  stock INTEGER DEFAULT 0,
  sold INTEGER DEFAULT 0,
  badge TEXT,
  image_url TEXT,
  variations TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_address TEXT,
  phone_number TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  size TEXT,
  price_at_purchase REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE feedback (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
