-- Create ENUMS
CREATE TYPE user_role AS ENUM ('customer', 'employee', 'owner');
CREATE TYPE order_status AS ENUM ('pending', 'baking', 'ready', 'picked_up', 'paid');

-- Create PROFILES table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role user_role DEFAULT 'customer',
  phone TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Turn on RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Allow Employee and Owner to view all profiles (for order management)
-- Note: 'auth.uid()' checks against the current user's ID in the profiles table to see their role.
-- This requires a recursive check or a helper function to avoid infinite recursion if we query profiles directly.
-- A common pattern is using auth.jwt() -> app_metadata or keeping it simple. 
-- For this simple schema, we'll allow public profile reads or fetch roles via a secure view is better?
-- Simpler approach: Allow READ if user is employee/owner.
-- But how do we know if user is employee? We need to read their profile.
-- We will use a function `is_staff()` for cleanliness or just a direct query if we trust the initial setup.

-- Efficient Role Check via Function
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('employee', 'owner')
  );

-- Create PRODUCTS table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in cents
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Turn on RLS for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Products Policies
CREATE POLICY "Public read active products"
  ON products FOR SELECT
  USING (is_active = true OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');

CREATE POLICY "Owner can crud products"
  ON products FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');


-- Create ORDERS table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id) NOT NULL,
  status order_status DEFAULT 'pending',
  total_amount INTEGER, -- in cents
  pickup_date TIMESTAMP WITH TIME ZONE NOT NULL,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Turn on RLS for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Orders Policies
CREATE POLICY "Customer can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Employee can view all orders"
  ON orders FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('employee', 'owner'));

-- Note: We cannot HIDE the 'total_amount' column easily with standard RLS. 
-- The frontend for Employee will just NOT show it. 
-- If strict security is needed, we would create a view 'kitchen_orders' without that column.
-- For this implementation, we rely on Frontend + Trust (Employee role).

CREATE POLICY "Customer can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Staff can update orders"
  ON orders FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('employee', 'owner'));


-- Create ORDER_ITEMS table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- Turn on RLS for order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Order Items Policies
CREATE POLICY "View order items if can view order"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id 
      AND (
         orders.customer_id = auth.uid() 
         OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('employee', 'owner')
      )
    )
  );

CREATE POLICY "Customer can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()
    )
  );

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
