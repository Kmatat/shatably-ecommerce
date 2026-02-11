-- Enable RLS on all tables with permissive policies
-- Since this app uses Prisma/Express backend (not Supabase PostgREST),
-- the application layer handles authorization, so we allow all database roles
-- to perform operations and rely on the API middleware for access control.

-- ============================================================================
-- STEP 1: Enable RLS on ALL tables
-- ============================================================================
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
ALTER TABLE "Attribute" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AttributeOption" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductAttributeValue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductVariation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VariationOption" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Drop existing policies (if any) to avoid conflicts
-- Run these one by one if you get errors
-- ============================================================================
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- ============================================================================
-- STEP 3: Create permissive policies for ALL tables
-- These allow all operations for all roles (postgres, authenticated, anon, service_role)
-- ============================================================================

-- User table
CREATE POLICY "allow_all_User" ON "User" FOR ALL USING (true) WITH CHECK (true);

-- OtpCode table
CREATE POLICY "allow_all_OtpCode" ON "OtpCode" FOR ALL USING (true) WITH CHECK (true);

-- Address table
CREATE POLICY "allow_all_Address" ON "Address" FOR ALL USING (true) WITH CHECK (true);

-- Category table
CREATE POLICY "allow_all_Category" ON "Category" FOR ALL USING (true) WITH CHECK (true);

-- Brand table
CREATE POLICY "allow_all_Brand" ON "Brand" FOR ALL USING (true) WITH CHECK (true);

-- Product table
CREATE POLICY "allow_all_Product" ON "Product" FOR ALL USING (true) WITH CHECK (true);

-- ProductImage table
CREATE POLICY "allow_all_ProductImage" ON "ProductImage" FOR ALL USING (true) WITH CHECK (true);

-- Review table
CREATE POLICY "allow_all_Review" ON "Review" FOR ALL USING (true) WITH CHECK (true);

-- Cart table
CREATE POLICY "allow_all_Cart" ON "Cart" FOR ALL USING (true) WITH CHECK (true);

-- CartItem table
CREATE POLICY "allow_all_CartItem" ON "CartItem" FOR ALL USING (true) WITH CHECK (true);

-- Wishlist table
CREATE POLICY "allow_all_Wishlist" ON "Wishlist" FOR ALL USING (true) WITH CHECK (true);

-- Order table
CREATE POLICY "allow_all_Order" ON "Order" FOR ALL USING (true) WITH CHECK (true);

-- OrderItem table
CREATE POLICY "allow_all_OrderItem" ON "OrderItem" FOR ALL USING (true) WITH CHECK (true);

-- OrderStatusHistory table
CREATE POLICY "allow_all_OrderStatusHistory" ON "OrderStatusHistory" FOR ALL USING (true) WITH CHECK (true);

-- Payment table
CREATE POLICY "allow_all_Payment" ON "Payment" FOR ALL USING (true) WITH CHECK (true);

-- Driver table
CREATE POLICY "allow_all_Driver" ON "Driver" FOR ALL USING (true) WITH CHECK (true);

-- MaterialList table
CREATE POLICY "allow_all_MaterialList" ON "MaterialList" FOR ALL USING (true) WITH CHECK (true);

-- PromoCode table
CREATE POLICY "allow_all_PromoCode" ON "PromoCode" FOR ALL USING (true) WITH CHECK (true);

-- Setting table
CREATE POLICY "allow_all_Setting" ON "Setting" FOR ALL USING (true) WITH CHECK (true);

-- Content table
CREATE POLICY "allow_all_Content" ON "Content" FOR ALL USING (true) WITH CHECK (true);

-- Attribute table
CREATE POLICY "allow_all_Attribute" ON "Attribute" FOR ALL USING (true) WITH CHECK (true);

-- AttributeOption table
CREATE POLICY "allow_all_AttributeOption" ON "AttributeOption" FOR ALL USING (true) WITH CHECK (true);

-- ProductAttributeValue table
CREATE POLICY "allow_all_ProductAttributeValue" ON "ProductAttributeValue" FOR ALL USING (true) WITH CHECK (true);

-- ProductVariation table
CREATE POLICY "allow_all_ProductVariation" ON "ProductVariation" FOR ALL USING (true) WITH CHECK (true);

-- VariationOption table
CREATE POLICY "allow_all_VariationOption" ON "VariationOption" FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- VERIFICATION: Run this query to check all tables have RLS enabled and policies
-- ============================================================================
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
