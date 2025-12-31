-- Fix RLS Infinite Recursion

-- 1. Ensure the helper function exists and is SECURITY DEFINER (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Drop the problematic policy
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;

-- 3. Re-create the policy using the secure function
CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  USING (
    public.get_my_role() IN ('employee', 'owner')
  );
