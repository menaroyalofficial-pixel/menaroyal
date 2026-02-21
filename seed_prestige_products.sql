-- MENA ROYAL: PRESTIGE ARCHIVE SEED (V12)
-- Target: 50+ Premium Products with complete taxonomy
-- Focus: Luxury, Heritage, and Occasion-based filtering

-- ============================================
-- 1. BRANDS (The Houses) - Multi-Origin
-- ============================================

INSERT INTO brands (name, slug, description, story, origin_country, status, featured, cover_image, instagram_handle)
VALUES 
('Maison Lalla', 'maison-lalla', 'Fes-based heritage house of high bridal couture.', 'Founded in 1924, Maison Lalla preserves the ancestral "Terz Fessi" embroidery techniques, passing them through four generations of master artisans.', 'Morocco', 'active', true, '/royal-velvet-caftan.jpg', '@maisonlalla_couture'),
('Noor Al-Amal', 'noor-alamal', 'Dubai-based label specializing in contemporary minimalist abayas.', 'Noor Al-Amal redefines the modern abaya with architectural silhouettes and premium Japanese silk blends, designed for the international woman of the Gulf.', 'UAE', 'active', true, '/sandstone-djellaba.jpg', '@nooralamal_official'),
('Amina Lebanese Jewelry', 'amina-jewelry', 'Beirut-based high jewelry atelier using heritage Phoenician motifs.', 'Amina Khalil crafts pieces that tell the story of the Mediterranean, using ethically sourced gemstones and 21k gold filigree.', 'Lebanon', 'active', true, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', '@aminajewelry_beirut'),
('Qatari Silk Collective', 'qatari-silk', 'Doha-based textile house specializing in hand-painted silk evening wear.', 'A collective of female artisans in Doha creating one-of-a-kind silk pieces inspired by the shifting sands of the Qatari desert.', 'Qatar', 'active', true, '/silk-aurora-caftan.jpg', '@qatarisilk_collective'),
('Sultana Saudi Couture', 'sultana-saudi', 'Riyadh high-fashion house blending royal heritage with gala elegance.', 'Providing gowns for the region''s most prestigious events, Sultana blends voluminous silhouettes with intricate crystal work.', 'Saudi Arabia', 'active', true, '/celestial-crepe-caftan.jpg', '@sultana_saudi'),
('Petra Stones', 'petra-stones', 'Jordanian workshop crafting modern accessories from desert minerals.', 'Each piece is hand-carved in Wadi Rum, celebrating the raw beauty of Jordanian geology.', 'Jordan', 'active', true, '/sandstone-djellaba.jpg', '@petrastones_jo')
ON CONFLICT (slug) DO UPDATE SET 
  origin_country = EXCLUDED.origin_country,
  instagram_handle = EXCLUDED.instagram_handle;

-- ============================================
-- 2. PRODUCTS (The Archive) - 50+ Items
-- ============================================

-- helper variables (assuming brands exist from above)
DO $$
DECLARE
    br_morocco_id UUID := (SELECT id FROM brands WHERE slug = 'maison-lalla');
    br_uae_id UUID := (SELECT id FROM brands WHERE slug = 'noor-alamal');
    br_lebanon_id UUID := (SELECT id FROM brands WHERE slug = 'amina-jewelry');
    br_qatar_id UUID := (SELECT id FROM brands WHERE slug = 'qatari-silk');
    br_saudi_id UUID := (SELECT id FROM brands WHERE slug = 'sultana-saudi');
    br_jordan_id UUID := (SELECT id FROM brands WHERE slug = 'petra-stones');
BEGIN

-- ---------------------------------------------------------
-- COLLECTION A: BRIDAL HERITAGE (Caftans & Gowns)
-- ---------------------------------------------------------
INSERT INTO products (brand_id, category_id, name, slug, description, price, images, materials, sizes, colors, occasion_tags, product_type, stock_status, featured)
VALUES
(br_morocco_id, 'caftan', 'The Royal Fassi Bridal Caftan', 'bridal-fassi-1', 'A museum-grade wedding caftan in cream silk with gold thread embroidery.', 4500.00, ARRAY['/royal-velvet-caftan.jpg'], ARRAY['Pure Silk', '24k Gold Thread'], ARRAY['M', 'L'], ARRAY['Ivory'], ARRAY['bridal'], 'caftan', 'made_to_order', true),
(br_morocco_id, 'caftan', 'Silver Thread Heritage Takchita', 'silver-takchita-1', 'Two-piece ceremonial gown featuring silver Zwaq embroidery.', 3800.00, ARRAY['/heritage-brocade-caftan.jpg'], ARRAY['Fine Brocade', 'Silver Sfifa'], ARRAY['S', 'M'], ARRAY['Silver', 'White'], ARRAY['bridal', 'special-occasions'], 'takchita', 'made_to_order', true),
(br_saudi_id, 'caftan', 'The Empress Gala Gown', 'empress-gala-1', 'Voluminous velvet gown with hand-applied crystals and floor-length sleeves.', 5200.00, ARRAY['/royal-velvet-caftan.jpg'], ARRAY['Premium Velvet', 'Swarovski Crystals'], ARRAY['M'], ARRAY['Emerald Green'], ARRAY['special-occasions'], 'gown', 'in_stock', true),
(br_qatar_id, 'caftan', 'Desert Moon Silk Caftan', 'desert-moon-1', 'Hand-painted silk caftan with a gradient of midnight blue to silver.', 2800.00, ARRAY['/celestial-crepe-caftan.jpg'], ARRAY['Italian Silk'], ARRAY['L'], ARRAY['Midnight Blue'], ARRAY['special-occasions'], 'caftan', 'in_stock', false),
(br_morocco_id, 'caftan', 'Golden Hour Brocade Caftan', 'golden-hour-caftan', 'Stunning Fes brocade with geometric floral motifs in gold and apricot.', 3200.00, ARRAY['/heritage-brocade-caftan.jpg'], ARRAY['Silk Brocade'], ARRAY['M'], ARRAY['Gold'], ARRAY['bridal', 'special-occasions'], 'caftan', 'made_to_order', true);

-- ---------------------------------------------------------
-- COLLECTION B: CONTEMPORARY ABAYAS (UAE & Saudi)
-- ---------------------------------------------------------
INSERT INTO products (brand_id, category_id, name, slug, description, price, images, materials, sizes, colors, occasion_tags, product_type, stock_status, featured)
VALUES
(br_uae_id, 'abaya', 'The Minimalist Silk Abaya', 'minimalist-silk-1', 'Pure Japanese silk abaya with a clean, architectural drape.', 1200.00, ARRAY['/sandstone-djellaba.jpg'], ARRAY['Japanese Silk'], ARRAY['S', 'M', 'L'], ARRAY['Black'], ARRAY['everyday-luxury'], 'abaya', 'in_stock', true),
(br_uae_id, 'abaya', 'Sandstone Linen Abaya', 'sandstone-linen-1', 'Breathable Belgian linen abaya for the high-end resort traveler.', 950.00, ARRAY['/sandstone-djellaba.jpg'], ARRAY['Belgian Linen'], ARRAY['M'], ARRAY['Sand'], ARRAY['everyday-luxury', 'vacation'], 'abaya', 'in_stock', false),
(br_uae_id, 'abaya', 'Onyx Evening Abaya', 'onyx-evening-1', 'Heavy crepe abaya with delicate lace inserts along the collar.', 1500.00, ARRAY['/sandstone-djellaba.jpg'], ARRAY['Silk Crepe', 'French Lace'], ARRAY['M', 'L'], ARRAY['Onyx'], ARRAY['special-occasions'], 'abaya', 'in_stock', true),
(br_saudi_id, 'abaya', 'Royal Velvet Abaya', 'royal-velvet-abaya', 'Deep burgundy velvet abaya with structured shoulders.', 2100.00, ARRAY['/royal-velvet-caftan.jpg'], ARRAY['Velvet'], ARRAY['M'], ARRAY['Burgundy'], ARRAY['special-occasions'], 'abaya', 'made_to_order', true),
(br_uae_id, 'abaya', 'Pearl Tulle Abaya', 'pearl-tulle-abaya', 'Exquisite tulle overlay adorned with hand-sewn freshwater pearls.', 2400.00, ARRAY['/silk-aurora-caftan.jpg'], ARRAY['Tulle', 'Pearls'], ARRAY['S', 'M'], ARRAY['White'], ARRAY['bridal', 'special-occasions'], 'abaya', 'made_to_order', true);

-- ---------------------------------------------------------
-- COLLECTION C: MODERN DJELLABAS & RESORT
-- ---------------------------------------------------------
INSERT INTO products (brand_id, category_id, name, slug, description, price, images, materials, sizes, colors, occasion_tags, product_type, stock_status, featured)
VALUES
(br_morocco_id, 'djellaba', 'Atlas Wool Winter Djellaba', 'atlas-wool-1', 'Heavy merino wool djellaba with a silk hood lining.', 850.00, ARRAY['/atlas-wool-djellaba.jpg'], ARRAY['Merino Wool'], ARRAY['M', 'L', 'XL'], ARRAY['Ivory'], ARRAY['everyday-luxury'], 'djellaba', 'in_stock', false),
(br_morocco_id, 'djellaba', 'Silk Blend Summer Djellaba', 'summer-djellaba-1', 'Lightweight silk-cotton blend for the modern urban archive.', 650.00, ARRAY['/sandstone-djellaba.jpg'], ARRAY['Silk-Cotton'], ARRAY['S', 'M'], ARRAY['Light Blue'], ARRAY['everyday-luxury'], 'djellaba', 'in_stock', true),
(br_jordan_id, 'djellaba', 'Wadi Rum Linen Tunic', 'wadi-rum-tunic', 'Structural linen tunic inspired by the silhouettes of the Levant.', 720.00, ARRAY['/sandstone-djellaba.jpg'], ARRAY['Linen'], ARRAY['M', 'L'], ARRAY['Terracotta'], ARRAY['everyday-luxury', 'vacation'], 'tunic', 'in_stock', false);

-- ... (Adding many more for 50+)
-- ---------------------------------------------------------
-- REPETITIVE DATA SET GENERATION FOR VOLUME
-- ---------------------------------------------------------

INSERT INTO products (brand_id, category_id, name, slug, description, price, images, materials, sizes, colors, occasion_tags, product_type, stock_status, featured)
VALUES
(br_lebanon_id, 'jewelry', 'Phoenician Sun Necklace', 'phoenician-sun-1', '21k gold handcrafted medallion featuring ancient seafaring motifs.', 3200.00, ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'], ARRAY['21k Gold'], ARRAY['One Size'], ARRAY['Gold'], ARRAY['special-occasions'], 'necklace', 'in_stock', true),
(br_lebanon_id, 'jewelry', 'Cedar Branch Earrings', 'cedar-earrings-1', 'Delicate gold earrings inspired by the mountains of Lebanon.', 1800.00, ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'], ARRAY['18k Gold'], ARRAY['One Size'], ARRAY['Gold'], ARRAY['everyday-luxury'], 'earrings', 'in_stock', false),
(br_lebanon_id, 'jewelry', 'Lapis Lazuli Ring', 'lapis-ring-1', 'Statement ring with a deep azure lapis lazuli stone.', 2400.00, ARRAY['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80'], ARRAY['Gold', 'Lapis Lazuli'], ARRAY['7', '8'], ARRAY['Blue'], ARRAY['special-occasions'], 'ring', 'in_stock', true);

-- [Batch 1: 10 more caftans]
INSERT INTO products (brand_id, category_id, name, slug, description, price, images, materials, sizes, colors, occasion_tags, product_type, stock_status)
SELECT br_morocco_id, 'caftan', 'Premium Caftan ' || i, 'caftan-gen-' || i, 'High fidelity heritage caftan variant ' || i, 1500 + (i * 100), ARRAY['/royal-velvet-caftan.jpg'], ARRAY['Silk'], ARRAY['M'], ARRAY['Varie'], ARRAY['special-occasions'], 'caftan', 'in_stock'
FROM generate_series(1, 10) as i;

-- [Batch 2: 10 more abayas]
INSERT INTO products (brand_id, category_id, name, slug, description, price, images, materials, sizes, colors, occasion_tags, product_type, stock_status)
SELECT br_uae_id, 'abaya', 'Noor Abaya ' || i, 'abaya-gen-' || i, 'Minimalist luxury abaya variant ' || i, 900 + (i * 50), ARRAY['/sandstone-djellaba.jpg'], ARRAY['Crepe'], ARRAY['L'], ARRAY['Black'], ARRAY['everyday-luxury'], 'abaya', 'in_stock'
FROM generate_series(1, 10) as i;

-- [Batch 3: 10 more Jewelry]
INSERT INTO products (brand_id, category_id, name, slug, description, price, images, materials, sizes, colors, occasion_tags, product_type, stock_status)
SELECT br_lebanon_id, 'jewelry', 'Heritage Piece ' || i, 'jewel-gen-' || i, 'Boutique heritage jewelry series ' || i, 2000 + (i * 200), ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'], ARRAY['Gold'], ARRAY['One Size'], ARRAY['Gold'], ARRAY['special-occasions'], 'jewelry', 'in_stock'
FROM generate_series(1, 10) as i;

-- [Batch 4: 5 more Djellabas]
INSERT INTO products (brand_id, category_id, name, slug, description, price, images, materials, sizes, colors, occasion_tags, product_type, stock_status)
SELECT br_morocco_id, 'djellaba', 'Urban Djellaba ' || i, 'djellaba-gen-' || i, 'Casual heritage djellaba ' || i, 400 + (i * 30), ARRAY['/atlas-wool-djellaba.jpg'], ARRAY['Cotton'], ARRAY['M'], ARRAY['Sand'], ARRAY['everyday-luxury'], 'djellaba', 'in_stock'
FROM generate_series(1, 5) as i;

-- [Batch 5: 5 Qatari Gowns]
INSERT INTO products (brand_id, category_id, name, slug, description, price, images, materials, sizes, colors, occasion_tags, product_type, stock_status)
SELECT br_qatar_id, 'caftan', 'Silk Gown ' || i, 'qatar-gen-' || i, 'Hand-painted Qatari luxury gown ' || i, 3000 + (i * 500), ARRAY['/silk-aurora-caftan.jpg'], ARRAY['Pure Silk'], ARRAY['M'], ARRAY['Multicolor'], ARRAY['special-occasions'], 'gown', 'made_to_order'
FROM generate_series(1, 5) as i;

END $$;

-- ============================================
-- 3. FINAL TAXONOMY SYNC
-- ============================================

-- Ensure all brands have origin set correctly if they didn't
UPDATE brands SET origin_country = 'Morocco' WHERE slug = 'maison-lalla';
UPDATE brands SET origin_country = 'UAE' WHERE slug = 'noor-alamal';
UPDATE brands SET origin_country = 'Lebanon' WHERE slug = 'amina-jewelry';
UPDATE brands SET origin_country = 'Qatar' WHERE slug = 'qatari-silk';
UPDATE brands SET origin_country = 'Saudi Arabia' WHERE slug = 'sultana-saudi';
UPDATE brands SET origin_country = 'Jordan' WHERE slug = 'petra-stones';

-- Ensure SKUs are generated for all
UPDATE products 
SET sku = CONCAT(
  UPPER(SUBSTRING(brands.slug, 1, 3)), 
  '-', 
  UPPER(category_id), 
  '-', 
  SUBSTRING(products.id::text, 1, 8)
)
FROM brands
WHERE products.brand_id = brands.id AND (products.sku IS NULL OR products.sku = '');

-- Verify
-- SELECT count(*) FROM products;
