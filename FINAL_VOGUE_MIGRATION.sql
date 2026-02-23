-- ======================================================
-- 🏛️ MENA ROYAL: FINAL VOGUE-LEVEL UPGRADE
-- ======================================================
-- This script upgrades your current basics to a "Big App" standard.
-- It adds luxury filtering (Origin, Occasion) and prepares the 
-- exclusive invitation system without deleting your existing data.

-- 1. LUXURY FILTERING UPGRADE
-- Adding origin to brands (for "Shop by Region")
ALTER TABLE brands ADD COLUMN IF NOT EXISTS origin_country TEXT;

-- Adding advanced meta to products (for "Shop by Occasion" and "Color")
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS occasion_tags TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS origin_country TEXT; -- Redundant but good for query speed

-- 2. INSTITUTIONAL INVITATION SYSTEM
-- We call this "institutional_leads" to avoid clashing with your "stock waitlist"
CREATE TABLE IF NOT EXISTS institutional_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    region TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for private leads
ALTER TABLE institutional_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public intake" ON institutional_leads;
CREATE POLICY "Public intake" ON institutional_leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin view" ON institutional_leads;
CREATE POLICY "Admin view" ON institutional_leads FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- 3. THE JOURNAL ARCHIVE (Blog)
-- Ensuring your editorial stories table is perfectly structured
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    excerpt TEXT,
    content TEXT,
    image TEXT,
    category TEXT DEFAULT 'Heritage',
    read_time TEXT DEFAULT '5 MIN READ',
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view stories" ON stories;
CREATE POLICY "Public view stories" ON stories FOR SELECT USING (published = true);

-- 4. UPDATE EXISTING BRAND REGIONS (Example fix for Mega Menu)
UPDATE brands SET origin_country = 'Morocco' WHERE slug = 'dar-rime';
UPDATE brands SET origin_country = 'Morocco' WHERE slug = 'atelier-atlas';

-- 5. FINAL TAXONOMY SYNC
-- Ensure your categories match the Mega Menu structure
INSERT INTO categories (id, name, description) VALUES 
('abaya', 'Abayas', 'Contemporary modesty meets heritage craftsmanship.'),
('caftan', 'Caftans', 'Elite heritage gowns featuring intricate artisanal embroidery.'),
('djellaba', 'Djellabas', 'Traditional silhouettes reimagined for the contemporary archive.'),
('maison', 'Maison', 'Curated furniture and textile art for the elevated home.'),
('jewelry', 'Jewelry', 'Exceptional precious metals and regional gemstones.')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 6. PERFORMANCE INDEXING (STRESS TEST READY)
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_origin ON products(origin_country);
CREATE INDEX IF NOT EXISTS idx_products_colors ON products USING GIN (colors);
CREATE INDEX IF NOT EXISTS idx_products_occasions ON products USING GIN (occasion_tags);
CREATE INDEX IF NOT EXISTS idx_brands_origin ON brands(origin_country);
CREATE INDEX IF NOT EXISTS idx_brands_status ON brands(status);

-- 7. PERMISSIONS & ROLES
UPDATE profiles SET role = 'super_admin' WHERE email = 'menaroyalofficial@gmail.com';
