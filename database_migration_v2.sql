-- MENA ROYAL DATABASE MIGRATION V2
-- This script ADDS new fields to existing tables WITHOUT breaking current functionality
-- Safe to run - uses ALTER TABLE ADD COLUMN IF NOT EXISTS

-- ============================================
-- 1. EXTEND PRODUCTS TABLE
-- ============================================

-- Add occasion tags (for Shop by Occasion filtering)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS occasion_tags text[] DEFAULT ARRAY[]::text[];

-- Add product type (Caftan, Takchita, Evening Dress, etc.)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS product_type text;

-- Add production time
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS production_time text DEFAULT '2-3 weeks';

-- Add shipping details
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS shipping_details text DEFAULT 'Free shipping on orders over $500. Standard delivery 14-21 business days.';

-- Add SKU (auto-generated)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sku text;

-- Add stock status
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_status text DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'made_to_order', 'sold_out'));

-- Add care instructions
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS care_instructions text DEFAULT 'Dry clean only. Store in a cool, dry place away from direct sunlight.';

-- ============================================
-- 2. EXTEND BRANDS TABLE
-- ============================================

-- Add designer origin/country
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS origin_country text;

-- Add Instagram handle
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS instagram_handle text;

-- Add designer photo
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS designer_photo text;

-- Add contact email
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS contact_email text;

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Index for occasion filtering
CREATE INDEX IF NOT EXISTS idx_products_occasion_tags ON products USING GIN (occasion_tags);

-- Index for product type filtering
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products (product_type);

-- Index for stock status filtering
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products (stock_status);

-- Index for designer origin filtering
CREATE INDEX IF NOT EXISTS idx_brands_origin_country ON brands (origin_country);

-- ============================================
-- 4. UPDATE EXISTING PRODUCTS WITH DEFAULT VALUES
-- ============================================

-- Set default occasion tags for existing caftans (Bridal + Special Occasions)
UPDATE products 
SET occasion_tags = ARRAY['bridal', 'special_occasions']
WHERE category_id = 'caftan' AND occasion_tags = ARRAY[]::text[];

-- Set default occasion tags for existing abayas (Everyday + Special Occasions)
UPDATE products 
SET occasion_tags = ARRAY['everyday_luxury', 'special_occasions']
WHERE category_id = 'abaya' AND occasion_tags = ARRAY[]::text[];

-- Set default occasion tags for existing djellabas (Everyday)
UPDATE products 
SET occasion_tags = ARRAY['everyday_luxury']
WHERE category_id = 'djellaba' AND occasion_tags = ARRAY[]::text[];

-- Set product types based on category
UPDATE products 
SET product_type = 'caftan'
WHERE category_id = 'caftan' AND product_type IS NULL;

UPDATE products 
SET product_type = 'abaya'
WHERE category_id = 'abaya' AND product_type IS NULL;

UPDATE products 
SET product_type = 'djellaba'
WHERE category_id = 'djellaba' AND product_type IS NULL;

-- Generate SKUs for existing products (format: BRAND-CATEGORY-ID)
UPDATE products 
SET sku = CONCAT(
  UPPER(SUBSTRING(brands.slug, 1, 3)), 
  '-', 
  UPPER(category_id), 
  '-', 
  SUBSTRING(products.id::text, 1, 8)
)
FROM brands
WHERE products.brand_id = brands.id AND products.sku IS NULL;

-- ============================================
-- 5. UPDATE EXISTING BRANDS WITH ORIGIN
-- ============================================

-- Set Morocco as default origin for existing brands
UPDATE brands 
SET origin_country = 'Morocco'
WHERE origin_country IS NULL;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check products table structure
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products';

-- Check brands table structure
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'brands';

-- Verify occasion tags are set
-- SELECT name, occasion_tags, product_type, sku FROM products LIMIT 10;
