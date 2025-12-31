-- Allow Employees to Manage Products

-- 1. Drop the old restrictive owner-only policy
DROP POLICY IF EXISTS "Owner can crud products" ON products;

-- 2. Create new policy for both Owner and Employee
CREATE POLICY "Staff can crud products"
  ON products FOR ALL
  USING (
    public.get_my_role() IN ('employee', 'owner')
  );
