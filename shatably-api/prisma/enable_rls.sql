-- Enable RLS on all tables
-- Since this app uses Prisma/Express backend (not Supabase PostgREST),
-- we enable RLS to satisfy security requirements but only allow
-- service_role access (which Prisma uses via the connection string)

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OtpCode" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Brand" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cart" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CartItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Wishlist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderStatusHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Driver" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MaterialList" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PromoCode" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Setting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Content" ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations for the postgres role
-- (This is the role used by Prisma through the connection string)
-- The anon and authenticated roles (used by PostgREST) will be blocked

-- User table
CREATE POLICY "Allow postgres full access to User" ON "User"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- OtpCode table
CREATE POLICY "Allow postgres full access to OtpCode" ON "OtpCode"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- Address table
CREATE POLICY "Allow postgres full access to Address" ON "Address"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- Category table
CREATE POLICY "Allow postgres full access to Category" ON "Category"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- Brand table
CREATE POLICY "Allow postgres full access to Brand" ON "Brand"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- Product table
CREATE POLICY "Allow postgres full access to Product" ON "Product"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- ProductImage table
CREATE POLICY "Allow postgres full access to ProductImage" ON "ProductImage"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- Review table
CREATE POLICY "Allow postgres full access to Review" ON "Review"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- Cart table
CREATE POLICY "Allow postgres full access to Cart" ON "Cart"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- CartItem table
CREATE POLICY "Allow postgres full access to CartItem" ON "CartItem"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- Wishlist table
CREATE POLICY "Allow postgres full access to Wishlist" ON "Wishlist"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- Order table
CREATE POLICY "Allow postgres full access to Order" ON "Order"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- OrderItem table
CREATE POLICY "Allow postgres full access to OrderItem" ON "OrderItem"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- OrderStatusHistory table
CREATE POLICY "Allow postgres full access to OrderStatusHistory" ON "OrderStatusHistory"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- Payment table
CREATE POLICY "Allow postgres full access to Payment" ON "Payment"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- Driver table
CREATE POLICY "Allow postgres full access to Driver" ON "Driver"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- MaterialList table
CREATE POLICY "Allow postgres full access to MaterialList" ON "MaterialList"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- PromoCode table
CREATE POLICY "Allow postgres full access to PromoCode" ON "PromoCode"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- Setting table
CREATE POLICY "Allow postgres full access to Setting" ON "Setting"
  FOR ALL TO postgres USING (true) WITH CHECK (true);

-- Content table
CREATE POLICY "Allow postgres full access to Content" ON "Content"
  FOR ALL TO postgres USING (true) WITH CHECK (true);
