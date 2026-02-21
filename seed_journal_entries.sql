-- MENA ROYAL: JOURNAL ARCHIVE SEED
-- High-end editorial content for the "Stories" section

-- 1. Create stories table if not exists (Safety check)
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    excerpt TEXT,
    content TEXT,
    image TEXT,
    category TEXT,
    read_time TEXT,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Inject Editorial Content
INSERT INTO stories (title, subtitle, read_time, category, image, excerpt, content)
VALUES 
(
    'The Silk Weaver of Fes', 
    'A Study in Ancestral Precision', 
    '12 MIN READ', 
    'HERITAGE', 
    'https://images.unsplash.com/photo-1590736962031-6ec690b240c5?w=1200&q=80',
    'Within the labyrinthine corridors of the Fes Medina, the hum of the loom is the heartbeat of a civilization. We explore the life of Maalem Idris, a fourth-generation master weaver who preserves the Fessi silk tradition.',
    'Full editorial content discussing the history of Moroccan silk, the intricate sfifa braiding techniques, and the preservation of heritage in a digital age...'
),
(
    'Emirati Minimalism', 
    'The Architectural Abaya', 
    '8 MIN READ', 
    'DESIGN', 
    'https://images.unsplash.com/photo-1583391733970-077559e354a3?w=1200&q=80',
    'Contemporary Dubai is the focal point for a new movement in modesty. Architects turned designers are reimagining the abaya as a structural masterpiece rather than just a garment.',
    'Exploring the intersection of architectural principles and textile drape. How black-on-black textures create depth without the need for embellishment...'
),
(
    'The Phoenician Gold Standard', 
    'Beirut’s Jewelry Renaissance', 
    '15 MIN READ', 
    'ATELIER', 
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80',
    'Beirut remains the jeweler to the kings of the Levant. We go behind the scenes at a high-gold atelier to see how ancient Phoenician motifs are being translated for today''s global collector.',
    'A deep dive into the lost-wax casting process and the ethical sourcing of gems in the Mediterranean basin...'
)
ON CONFLICT DO NOTHING;
