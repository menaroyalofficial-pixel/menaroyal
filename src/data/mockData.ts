export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  story: string;
  country: string;
  category: string;
  logo?: string;
  coverImage: string;
  featured: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  categoryId: string;
  brandId: string;
  brandName: string;
  materials: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  published: boolean;
  brands?: {
    name: string;
    slug: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export const categories: Category[] = [
  {
    id: "cat-1",
    name: "Bridal",
    slug: "bridal",
    description: "Exquisite bridal couture from the finest MENA ateliers",
    image: "https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800&q=80",
  },
  {
    id: "cat-2",
    name: "Fashion",
    slug: "fashion",
    description: "Contemporary fashion rooted in heritage craftsmanship",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
  },
  {
    id: "cat-3",
    name: "Maison",
    slug: "maison",
    description: "Refined furniture and home objects for the modern interior",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
  },
  {
    id: "cat-4",
    name: "Jewelry",
    slug: "jewelry",
    description: "Statement pieces forged in precious metals and stones",
    image: "https://images.unsplash.com/photo-1515562141589-67f0d569b4ae?w=800&q=80",
  },
];

export const brands: Brand[] = [
  {
    id: "brand-1",
    name: "Dar Al Arous",
    slug: "dar-al-arous",
    description: "Haute couture bridal atelier specializing in hand-embroidered gowns",
    story: "Founded in Beirut in 1987, Dar Al Arous has dressed generations of brides across the Middle East. Each gown is handcrafted over 400 hours using techniques passed down through three generations. The atelier's signature lies in its fusion of Ottoman-era embroidery patterns with contemporary silhouettes, creating pieces that honor heritage while embracing modernity.",
    country: "Lebanon",
    category: "Bridal",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    featured: true,
  },
  {
    id: "brand-2",
    name: "Maison Noor",
    slug: "maison-noor",
    description: "Luxury caftans and contemporary modest fashion",
    story: "Maison Noor reimagines the traditional caftan for the modern woman. Based in Marrakech, the brand sources silk from the finest mills and employs local artisans who practice age-old techniques of hand-weaving and embellishment. Every piece tells a story of Moroccan craftsmanship meeting Parisian elegance.",
    country: "Morocco",
    category: "Fashion",
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80",
    featured: true,
  },
  {
    id: "brand-3",
    name: "Khalil Atelier",
    slug: "khalil-atelier",
    description: "Architectural furniture and sculptural home objects",
    story: "Khalil Atelier bridges the gap between art and furniture. Working from a sprawling workshop in Amman, designer Rami Khalil creates pieces inspired by the geometric patterns of Islamic architecture. Each piece is made from locally sourced walnut and marble, combining traditional Levantine woodworking with modern minimalism.",
    country: "Jordan",
    category: "Maison",
    coverImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80",
    featured: true,
  },
];

export const products: Product[] = [
  // Bridal - Dar Al Arous
  {
    id: "prod-1",
    name: "The Beirut Gown",
    slug: "the-beirut-gown",
    description: "A breathtaking A-line gown featuring hand-embroidered Ottoman motifs in gold thread. The bodice is adorned with over 2,000 freshwater pearls, cascading into a cathedral-length train of French Chantilly lace.",
    price: 12500,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800&q=80",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    ],
    categoryId: "cat-1",
    brandId: "brand-1",
    brandName: "Dar Al Arous",
    materials: ["French Chantilly Lace", "Silk Organza", "Freshwater Pearls"],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Ivory"],
    stock: 3,
    featured: true,
    published: true,
  },
  {
    id: "prod-2",
    name: "The Damascus Veil Gown",
    slug: "the-damascus-veil-gown",
    description: "Inspired by the intricate patterns of Damascus steel, this column gown features laser-cut silk overlays that create a mesmerizing moiré effect. Hand-finished with crystal accents along the neckline.",
    price: 9800,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&q=80",
      "https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800&q=80",
    ],
    categoryId: "cat-1",
    brandId: "brand-1",
    brandName: "Dar Al Arous",
    materials: ["Mikado Silk", "Crystal Embellishments"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Champagne"],
    stock: 5,
    featured: false,
    published: true,
  },
  {
    id: "prod-3",
    name: "The Phoenicia Dress",
    slug: "the-phoenicia-dress",
    description: "A regal ball gown with a corseted bodice and voluminous tulle skirt. The bodice is entirely hand-beaded with Swarovski crystals in a pattern inspired by Phoenician mosaics.",
    price: 15000,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&q=80",
    ],
    categoryId: "cat-1",
    brandId: "brand-1",
    brandName: "Dar Al Arous",
    materials: ["Italian Tulle", "Swarovski Crystals", "Silk Satin"],
    sizes: ["S", "M", "L"],
    colors: ["White", "Blush"],
    stock: 2,
    featured: true,
    published: true,
  },
  {
    id: "prod-4",
    name: "The Cedar Gown",
    slug: "the-cedar-gown",
    description: "A minimalist crepe gown with dramatic cape sleeves and delicate gold leaf embroidery trailing down the back. Named after Lebanon's iconic cedar trees.",
    price: 8500,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800&q=80",
    ],
    categoryId: "cat-1",
    brandId: "brand-1",
    brandName: "Dar Al Arous",
    materials: ["Italian Crepe", "Gold Leaf Thread"],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Ivory", "Gold"],
    stock: 4,
    featured: false,
    published: true,
  },
  {
    id: "prod-5",
    name: "The Jasmine Suite",
    slug: "the-jasmine-suite",
    description: "A two-piece bridal ensemble: a fitted long-sleeve top with 3D floral appliqués and a flowing organza skirt. Perfect for the modern bride who wants versatility.",
    price: 7200,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&q=80",
    ],
    categoryId: "cat-1",
    brandId: "brand-1",
    brandName: "Dar Al Arous",
    materials: ["Silk Organza", "French Lace", "3D Floral Appliqués"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White"],
    stock: 6,
    featured: false,
    published: true,
  },
  // Fashion - Maison Noor
  {
    id: "prod-6",
    name: "The Marrakech Caftan",
    slug: "the-marrakech-caftan",
    description: "A floor-length silk caftan in deep emerald, featuring hand-embroidered gold sfifa trim along the neckline and cuffs. A statement piece for evening occasions.",
    price: 3200,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
      "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800&q=80",
    ],
    categoryId: "cat-2",
    brandId: "brand-2",
    brandName: "Maison Noor",
    materials: ["Pure Silk", "Gold Thread Embroidery"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Emerald", "Navy", "Burgundy"],
    stock: 8,
    featured: true,
    published: true,
  },
  {
    id: "prod-7",
    name: "The Fez Jacket",
    slug: "the-fez-jacket",
    description: "A structured blazer-style jacket reimagined in handwoven Moroccan fabric. Features traditional passementerie buttons and a modern tailored cut.",
    price: 1800,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800&q=80",
    ],
    categoryId: "cat-2",
    brandId: "brand-2",
    brandName: "Maison Noor",
    materials: ["Handwoven Wool", "Silk Lining"],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Sand", "Midnight Blue"],
    stock: 12,
    featured: false,
    published: true,
  },
  {
    id: "prod-8",
    name: "The Essaouira Wrap",
    slug: "the-essaouira-wrap",
    description: "A versatile silk wrap that can be worn as a dress, skirt, or shawl. Printed with an original pattern inspired by Essaouira's blue-and-white medina walls.",
    price: 950,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
    ],
    categoryId: "cat-2",
    brandId: "brand-2",
    brandName: "Maison Noor",
    materials: ["Silk Twill"],
    sizes: ["One Size"],
    colors: ["Blue & White", "Terracotta"],
    stock: 15,
    featured: false,
    published: true,
  },
  {
    id: "prod-9",
    name: "The Atlas Coat",
    slug: "the-atlas-coat",
    description: "A dramatic floor-length coat in heavyweight wool, lined with printed silk. Inspired by Berber textiles, featuring geometric embroidery at the shoulders.",
    price: 4500,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800&q=80",
    ],
    categoryId: "cat-2",
    brandId: "brand-2",
    brandName: "Maison Noor",
    materials: ["Heavyweight Wool", "Silk Lining", "Embroidered Accents"],
    sizes: ["S", "M", "L"],
    colors: ["Camel", "Charcoal"],
    stock: 4,
    featured: true,
    published: true,
  },
  {
    id: "prod-10",
    name: "The Riad Dress",
    slug: "the-riad-dress",
    description: "A flowing midi dress with architectural pleating inspired by the courtyards of Moroccan riads. Made from organic cotton with hand-tied tassels.",
    price: 1200,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
    ],
    categoryId: "cat-2",
    brandId: "brand-2",
    brandName: "Maison Noor",
    materials: ["Organic Cotton", "Hand-Tied Tassels"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Ivory", "Sage"],
    stock: 10,
    featured: false,
    published: true,
  },
  // Maison - Khalil Atelier
  {
    id: "prod-11",
    name: "The Petra Console",
    slug: "the-petra-console",
    description: "A sculptural console table carved from a single block of Jordanian sandstone, with hand-turned walnut legs. The surface features a natural stone grain that makes each piece unique.",
    price: 6800,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    ],
    categoryId: "cat-3",
    brandId: "brand-3",
    brandName: "Khalil Atelier",
    materials: ["Jordanian Sandstone", "Black Walnut"],
    sizes: ["Standard"],
    colors: ["Natural Stone"],
    stock: 2,
    featured: true,
    published: true,
  },
  {
    id: "prod-12",
    name: "The Amman Lounge Chair",
    slug: "the-amman-lounge-chair",
    description: "A low-slung lounge chair with a bent-wood frame and hand-woven leather strapping. Inspired by mid-century modernism filtered through Levantine design sensibilities.",
    price: 4200,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    ],
    categoryId: "cat-3",
    brandId: "brand-3",
    brandName: "Khalil Atelier",
    materials: ["Bent Walnut Wood", "Hand-Woven Leather"],
    sizes: ["Standard"],
    colors: ["Walnut / Tan", "Walnut / Black"],
    stock: 6,
    featured: false,
    published: true,
  },
  {
    id: "prod-13",
    name: "The Arabesque Shelf",
    slug: "the-arabesque-shelf",
    description: "A wall-mounted shelving unit with interlocking geometric forms derived from Islamic geometric patterns. Made from solid brass and smoked glass.",
    price: 3500,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
    ],
    categoryId: "cat-3",
    brandId: "brand-3",
    brandName: "Khalil Atelier",
    materials: ["Solid Brass", "Smoked Glass"],
    sizes: ["Standard"],
    colors: ["Brass / Smoke"],
    stock: 4,
    featured: false,
    published: true,
  },
  {
    id: "prod-14",
    name: "The Citadel Dining Table",
    slug: "the-citadel-dining-table",
    description: "A commanding dining table seating eight, crafted from live-edge olive wood with a polished concrete base. The natural grain of the olive wood tells the story of centuries of growth.",
    price: 9500,
    currency: "USD",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    ],
    categoryId: "cat-3",
    brandId: "brand-3",
    brandName: "Khalil Atelier",
    materials: ["Live-Edge Olive Wood", "Polished Concrete"],
    sizes: ["Seats 6", "Seats 8"],
    colors: ["Natural"],
    stock: 1,
    featured: true,
    published: true,
  },
];

export const getProductsByCategory = (categorySlug: string) =>
  products.filter((p) => {
    const cat = categories.find((c) => c.id === p.categoryId);
    return cat?.slug === categorySlug;
  });

export const getProductsByBrand = (brandSlug: string) =>
  products.filter((p) => {
    const brand = brands.find((b) => b.id === p.brandId);
    return brand?.slug === brandSlug;
  });

export const getProductBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);

export const getBrandBySlug = (slug: string) =>
  brands.find((b) => b.slug === slug);

export const getFeaturedProducts = () => products.filter((p) => p.featured);

export const formatPrice = (price: number, currency: string = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);
