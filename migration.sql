-- Run this in Cloudflare Dashboard > D1 > zanny-db > Console > Execute
-- This will add the necessary tracking columns without deleting your existing orders.

ALTER TABLE orders ADD COLUMN tracking_number TEXT;
ALTER TABLE orders ADD COLUMN confirmed_at DATETIME;
ALTER TABLE orders ADD COLUMN shipped_at DATETIME;
ALTER TABLE orders ADD COLUMN delivered_at DATETIME;
