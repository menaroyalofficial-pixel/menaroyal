-- PRESTIGE COLLECTION SEED (V11 - ROOT ASSET PROTOCOL)
-- This script updates all local asset paths to the ROOT directory.
-- It works in conjunction with the simplified public folder strategy.

-- 1. Ensure Institutional Taxonomy (Categories) exists
insert into categories (id, name, description) values 
('abaya', 'Abayas', 'Contemporary modesty meets heritage craftsmanship.'),
('caftan', 'Caftans', 'Elite heritage gowns featuring intricate artisanal embroidery.'),
('djellaba', 'Djellabas', 'Traditional silhouettes reimagined for the contemporary archive.'),
('maison', 'Maison', 'Curated furniture and textile art for the elevated home.')
on conflict (id) do update set 
  name = excluded.name,
  description = excluded.description;

-- 2. Ensure Brands exist and are active
insert into brands (name, slug, description, story, country, category, status, featured, cover_image)
values 
('Dar Rime', 'dar-rime', 'Elite Moroccan couture house specializing in hand-embroidered heritage pieces.', 'Founded in the heart of the Marrakech Medina, Dar Rime represents the pinnacle of Moroccan artisanal excellence, blending centuries-old embroidery techniques with contemporary luxury silhouettes.', 'Morocco', 'Fashion', 'active', true, '/royal-velvet-caftan.jpg'),
('Atelier Atlas', 'atelier-atlas', 'Curators of the finest hand-knotted Berber rugs and heritage textile art.', 'Born from the high peaks of the Middle Atlas, our atelier partners with the most skilled woman-led cooperatives to archive and promote the ancestral art of weaving.', 'Morocco', 'Maison', 'active', true, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80')
on conflict (slug) do update set 
  status = 'active',
  featured = true,
  cover_image = excluded.cover_image;

-- 3. Inject the Dar Rime Archive (ROOT Local Asset Integration)
with dar_rime_brand as (select id from brands where slug = 'dar-rime' limit 1)
insert into products (brand_id, category_id, name, slug, description, price, currency, images, materials, sizes, colors, stock, featured, published)
values 
-- CAFTANS (Using Verified Local Assets at Root)
((select id from dar_rime_brand), 'caftan', 'The Royal Velvet Caftan', 'the-royal-velvet-caftan', 'A majestic floor-length caftan in deep emerald velvet, featuring hand-embroidered gold sfifa trim. A masterpiece of Fes craftsmanship.', 1200.00, 'USD', ARRAY['/royal-velvet-caftan.jpg'], ARRAY['Premium Velvet', 'Gold Thread'], ARRAY['M', 'L'], ARRAY['Emerald'], 5, true, true),
((select id from dar_rime_brand), 'caftan', 'The Silk Aurora Caftan', 'the-silk-aurora-caftan', 'Etherial hand-painted silk caftan with delicate pearl embellishments and a subtle shimmer.', 950.00, 'USD', ARRAY['/silk-aurora-caftan.jpg'], ARRAY['Hand-painted Silk', 'Freshwater Pearls'], ARRAY['S', 'M', 'L'], ARRAY['Aurora Pink'], 3, true, true),
((select id from dar_rime_brand), 'caftan', 'The Heritage Brocade Caftan', 'the-heritage-brocade-caftan', 'Constructed from authentic Fes brocade with intricate silver thread patterns.', 1500.00, 'USD', ARRAY['/heritage-brocade-caftan.jpg', '/heritage-brocade-caftan-2.jpg'], ARRAY['Silk Brocade', 'Silver Thread'], ARRAY['M', 'L'], ARRAY['Royal Silver'], 2, true, true),
((select id from dar_rime_brand), 'caftan', 'The Celestial Crepe Caftan', 'the-celestial-crepe-caftan', 'Midnight blue silk crepe with a crystal constellation work across the shoulders.', 1100.00, 'USD', ARRAY['/celestial-crepe-caftan.jpg'], ARRAY['Silk Crepe', 'Crystals'], ARRAY['XS', 'S', 'M'], ARRAY['Midnight Blue'], 4, true, true),

-- ABAYAS (Using Local Djellaba assets as authentic placeholders)
((select id from dar_rime_brand), 'abaya', 'The Midnight Abaya', 'the-midnight-abaya', 'A serene, flowing silhouette crafted from Japanese crepe. Minimalist elegance for the modern woman.', 800.00, 'USD', ARRAY['/sandstone-djellaba.jpg'], ARRAY['Japanese Crepe'], ARRAY['M', 'L'], ARRAY['Obsidian Black'], 10, true, true),
((select id from dar_rime_brand), 'abaya', 'The Desert Rose Abaya', 'the-desert-rose-abaya', 'Soft linen blend in a muted rose tone, perfect for transitional seasons.', 650.00, 'USD', ARRAY['/atlas-wool-djellaba.jpg'], ARRAY['Linen Blend'], ARRAY['S', 'M', 'L'], ARRAY['Desert Rose'], 8, true, true),

-- DJELLABAS (Using Verified Local Assets)
((select id from dar_rime_brand), 'djellaba', 'The Sandstone Djellaba', 'the-sandstone-djellaba', 'Handwoven premium cotton djellaba in a minimalist sandstone shade.', 450.00, 'USD', ARRAY['/sandstone-djellaba.jpg'], ARRAY['Handwoven Cotton'], ARRAY['M', 'L', 'XL'], ARRAY['Sandstone'], 8, false, true),
((select id from dar_rime_brand), 'djellaba', 'The Atlas Wool Djellaba', 'the-atlas-wool-djellaba', 'Woven from the finest High Atlas merino wool. Institutional elegance for the winter season.', 600.00, 'USD', ARRAY['/atlas-wool-djellaba.jpg'], ARRAY['Merino Wool'], ARRAY['S', 'M', 'L'], ARRAY['Ivory'], 6, false, true)

on conflict (slug) do update set 
  images = excluded.images,
  description = excluded.description,
  price = excluded.price,
  category_id = excluded.category_id,
  name = excluded.name;

-- 4. Inject the Maison Archive (Berber Rugs - Keeping External for reliability)
with atelier_atlas_brand as (select id from brands where slug = 'atelier-atlas' limit 1)
insert into products (brand_id, category_id, name, slug, description, price, currency, images, materials, sizes, colors, stock, featured, published)
values 
((select id from atelier_atlas_brand), 'maison', 'Ben Ourain "Infinite Line"', 'ben-ourain-infinite-line', 'A quintessential hand-knotted high-pile rug in natural ivory wool with a single, dramatic obsidian line.', 2200.00, 'USD', ARRAY['https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80'], ARRAY['Organic Wool'], ARRAY['2x3m', '3x4m'], ARRAY['Natural Ivory'], 1, true, true),
((select id from atelier_atlas_brand), 'maison', 'Azilal "Labyrinth"', 'azilal-labyrinth', 'A vibrant low-pile rug featuring multi-colored geometric patterns.', 1850.00, 'USD', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'], ARRAY['Wool', 'Natural Dyes'], ARRAY['1.5x2.5m'], ARRAY['Multi'], 2, true, true)
on conflict (slug) do update set 
  images = excluded.images;
