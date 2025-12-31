-- Add 'cancelled' to order_status enum
-- Postgres doesn't support adding to enum inside a transaction easily if used by a table.
-- But since we are likely just running this as a query:

ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'cancelled';
