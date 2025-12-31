-- Create STORE_SETTINGS table (Singleton pattern)
CREATE TABLE store_settings (
  id INT PRIMARY KEY DEFAULT 1,
  pickup_days INT[] DEFAULT '{0,1,2,3,4,5,6}', -- 0=Sun, 6=Sat
  CONSTRAINT single_row CHECK (id = 1)
);

-- Turn on RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can read store settings"
  ON store_settings FOR SELECT
  USING (true);

CREATE POLICY "Owner can update store settings"
  ON store_settings FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');

-- Insert default row if not exists
INSERT INTO store_settings (id, pickup_days)
VALUES (1, '{0,1,2,3,4,5,6}')
ON CONFLICT (id) DO NOTHING;
