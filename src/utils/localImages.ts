// Local Image Manifest - Root Public Access
// Using direct paths to public folder to avoid bundler complexity

export const localImages: Record<string, string> = {
    // Caftans
    'the-royal-velvet-caftan': '/royal-velvet-caftan.jpg',
    'the-silk-aurora-caftan': '/silk-aurora-caftan.jpg',
    'the-heritage-brocade-caftan': '/heritage-brocade-caftan.jpg',
    'the-celestial-crepe-caftan': '/celestial-crepe-caftan.jpg',

    // Abayas (Mapped placeholders)
    'the-midnight-abaya': '/sandstone-djellaba.jpg',
    'the-desert-rose-abaya': '/atlas-wool-djellaba.jpg',

    // Djellabas
    'the-sandstone-djellaba': '/sandstone-djellaba.jpg',
    'the-atlas-wool-djellaba': '/atlas-wool-djellaba.jpg',
};

// Helper to get image for a product
export const getProductImage = (slug: string, index: number = 0): string | null => {
    if (index === 0 && localImages[slug]) return localImages[slug];
    // Add logic for secondary images if needed, e.g. heritage-2
    if (slug === 'the-heritage-brocade-caftan' && index === 1) return '/heritage-brocade-caftan-2.jpg';
    return null;
};
