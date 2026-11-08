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

    // Maison
    'ben-ourain-infinite-line': '/assets/products/Ben%20Ourain-Infinite%20Line.png',
};

/**
 * Photos fixed in code until the database row is updated
 * (supabase/migrations/20261108_solana_v1.sql does the same in the database).
 * Ben Ourain "Infinite Line": the database points to a stock photo that does not
 * show the rug. This is the real photo of the rug from the project assets.
 */
export const imageOverrides: Record<string, string[]> = {
    'ben-ourain-infinite-line': ['/assets/products/Ben%20Ourain-Infinite%20Line.png'],
};

export function withImageOverride<T extends { slug?: string; images?: string[] | null }>(product: T): T {
    if (!product?.slug || !imageOverrides[product.slug]) return product;
    return { ...product, images: imageOverrides[product.slug] };
}

// Helper to get image for a product
export const getProductImage = (slug: string, index: number = 0): string | null => {
    if (index === 0 && localImages[slug]) return localImages[slug];
    // Add logic for secondary images if needed, e.g. heritage-2
    if (slug === 'the-heritage-brocade-caftan' && index === 1) return '/heritage-brocade-caftan-2.jpg';
    return null;
};
