import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/product/ProductCard";
import { productService } from "@/services/productService";
import { brandService } from "@/services/brandService";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

// Occasions map to URL slugs
const OCCASIONS: Record<string, string> = {
  'bridal': 'Bridal',
  'wedding-guest': 'Wedding Guest',
  'special-occasions': 'Special Occasions',
  'everyday-luxury': 'Everyday Luxury'
};

const Shop = () => {
  const { category: urlSlug } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedColor, setSelectedColor] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");

  // New filters from URL
  const productType = searchParams.get('type') || undefined;
  const origin = searchParams.get('origin') || undefined;

  // Derive origins from brands
  const origins = Array.from(new Set(brands.map(b => b.origin_country).filter(Boolean)));

  const institutionalColors = [
    { name: "PURE IVORY", value: "ivory", hex: "#FDFCF0" },
    { name: "ROYAL GOLD", value: "gold", hex: "#D4AF37" },
    { name: "EMERALD HERITAGE", value: "emerald", hex: "#046307" },
    { name: "DESERT SAND", value: "sand", hex: "#C2B280" },
    { name: "MIDNIGHT INDIGO", value: "indigo", hex: "#000080" },
    { name: "OBSIDIAN BLACK", value: "black", hex: "#000000" }
  ];

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cats, activeBrands] = await Promise.all([
          productService.getCategories(),
          brandService.getActiveBrands()
        ]);
        // TEMPORARY: Hide 'maison' category - remove filter to reactivate
        const visibleCategories = (cats || []).filter((cat: any) => cat.id !== 'maison');
        setCategories(visibleCategories);
        setBrands(activeBrands || []);
      } catch (error) {
        console.error("Archive Meta Fetch Error:", error);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Determine if slug is an occasion or a category
        const isOccasion = urlSlug && OCCASIONS[urlSlug];
        const activeCat = !isOccasion ? categories.find(c => c.id === urlSlug) : null;

        // Build filters
        const filters: any = {
          brandId: selectedBrand,
          sortBy: sortBy,
          productType: productType,
          origin: origin
        };

        if (isOccasion) {
          // It's an occasion (e.g. /shop/bridal)
          filters.occasion = urlSlug; // 'bridal'
        } else {
          // It's a category (e.g. /shop/caftan) or all
          filters.categoryId = activeCat?.id || urlSlug;
        }

        const data = await productService.getProducts(filters);

        let filtered = data || [];
        if (selectedColor !== "all") {
          filtered = filtered.filter(p => p.colors?.includes(selectedColor));
        }

        setProducts(filtered);
      } catch (error) {
        console.error("Archive Product Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categories.length >= 0) { // Allow running even if categories empty
      fetchProducts();
    }
  }, [urlSlug, selectedBrand, selectedColor, sortBy, categories, productType, origin]);

  const isOccasion = urlSlug && OCCASIONS[urlSlug];
  const activeCategory = !isOccasion ? categories.find((c) => c.id === urlSlug) : null;

  // Title logic
  let pageTitle = "The Archive";
  let pageSubtitle = "Global Collection";
  let pageDescription = "";

  if (isOccasion) {
    pageTitle = OCCASIONS[urlSlug!];
    pageSubtitle = "Curated For";
    pageDescription = `Explore our exclusive selection of pieces perfectly suited for ${OCCASIONS[urlSlug!].toLowerCase()}.`;
  } else if (activeCategory) {
    pageTitle = activeCategory.name;
    pageSubtitle = "Institutional Archive";
    pageDescription = activeCategory.description;
  }

  if (origin) pageSubtitle += ` • ${origin.toUpperCase()}`;
  if (productType) pageSubtitle += ` • ${productType.toUpperCase()}S`;

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        {/* Header */}
        <div className="pt-32 pb-16 border-b border-border">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
            <div className="flex flex-col items-center text-center">
              <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-6 uppercase tracking-[0.3em]">
                {pageSubtitle}
              </p>
              <h1 className="font-serif text-5xl lg:text-8xl font-light text-foreground tracking-tighter capitalize">
                {pageTitle}
              </h1>
              {(pageDescription) && (
                <p className="font-sans text-[10px] text-muted-foreground mt-8 max-w-xl mx-auto leading-relaxed editorial-spacing font-light uppercase opacity-60">
                  {pageDescription}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Global Navigation Hub */}
        <div className="border-b border-border bg-white sticky top-20 z-40">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
            <div className="flex items-center justify-center gap-8 lg:gap-12 overflow-x-auto py-6 scrollbar-none">
              <Link
                to="/shop"
                className={`font-sans text-[10px] editorial-spacing whitespace-nowrap transition-all duration-300 pb-1 border-b ${!urlSlug ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground hover:border-foreground/30"
                  }`}
              >
                ALL EXHIBITS
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop/${cat.id}`}
                  className={`font-sans text-[10px] editorial-spacing whitespace-nowrap transition-all duration-300 pb-1 border-b ${urlSlug === cat.id ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground hover:border-foreground/30"
                    }`}
                >
                  {cat.name.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16">

            {/* Sidebar Filters */}
            <aside className="lg:col-span-3 space-y-12">
              <div className="sticky top-48 space-y-16">

                {/* Ateliers Filter */}
                <div className="space-y-8">
                  <h3 className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase opacity-40">The Houses</h3>
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => setSelectedBrand("all")}
                      className={`text-left font-sans text-[11px] editorial-spacing transition-all ${selectedBrand === "all" ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      ALL ATELIERS
                    </button>
                    {brands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => setSelectedBrand(brand.id)}
                        className={`text-left font-sans text-[11px] editorial-spacing transition-all ${selectedBrand === brand.id ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        {brand.name.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Occasion Filter */}
                <div className="space-y-8 pt-12 border-t border-border">
                  <h3 className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase opacity-40">Occasion</h3>
                  <div className="flex flex-col gap-4">
                    {Object.entries(OCCASIONS).map(([slug, name]) => (
                      <Link
                        key={slug}
                        to={`/shop/${slug}`}
                        className={`text-left font-sans text-[11px] editorial-spacing transition-all ${urlSlug === slug ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        {name.toUpperCase()}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Color Palette filter */}
                <div className="space-y-8 pt-12 border-t border-border">
                  <h3 className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase opacity-40">Heritage Tones</h3>
                  <div className="grid grid-cols-6 gap-3">
                    <button
                      onClick={() => setSelectedColor("all")}
                      className={`w-full aspect-square border border-border flex items-center justify-center ${selectedColor === "all" ? "bg-black" : "hover:border-foreground"}`}
                      title="All Colors"
                    >
                      <X className={`w-3 h-3 ${selectedColor === "all" ? "text-white" : "text-muted-foreground"}`} />
                    </button>
                    {institutionalColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setSelectedColor(color.value)}
                        className={`w-full aspect-square border border-border transition-all ${selectedColor === color.value ? "ring-1 ring-offset-2 ring-foreground" : "hover:border-foreground"
                          }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Region Filter */}
                <div className="space-y-8 pt-12 border-t border-border">
                  <h3 className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase opacity-40">Region</h3>
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete('origin');
                        setSearchParams(newParams);
                      }}
                      className={`text-left font-sans text-[11px] editorial-spacing transition-all ${!origin ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      ALL REGIONS
                    </button>
                    {origins.map((originName: any) => (
                      <button
                        key={originName}
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set('origin', originName);
                          setSearchParams(newParams);
                        }}
                        className={`text-left font-sans text-[11px] editorial-spacing transition-all ${origin === originName ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        {originName.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </aside>

            {/* Product Grid */}
            <main className="lg:col-span-9">
              <div className="flex justify-between items-center mb-8">
                <span className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase tracking-widest">
                  {products.length} EXHIBITS FOUND
                </span>

                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <button className="flex items-center gap-2 font-sans text-[10px] editorial-spacing uppercase hover:text-muted-foreground transition-colors">
                      Sort By <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-40">
                      <div className="bg-background border border-border p-2 shadow-lg">
                        <button onClick={() => setSortBy('featured')} className="block w-full text-left px-3 py-2 text-[10px] hover:bg-secondary/10 uppercase editorial-spacing">Featured</button>
                        <button onClick={() => setSortBy('newest')} className="block w-full text-left px-3 py-2 text-[10px] hover:bg-secondary/10 uppercase editorial-spacing">Newest</button>
                        <button onClick={() => setSortBy('price-asc')} className="block w-full text-left px-3 py-2 text-[10px] hover:bg-secondary/10 uppercase editorial-spacing">Price: Low to High</button>
                        <button onClick={() => setSortBy('price-desc')} className="block w-full text-left px-3 py-2 text-[10px] hover:bg-secondary/10 uppercase editorial-spacing">Price: High to Low</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-[3/4] bg-secondary/10 animate-pulse" />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                  <AnimatePresence>
                    {products.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-24 text-center border border-dashed border-border">
                  <p className="font-serif text-2xl text-muted-foreground mb-4">No exhibits found</p>
                  <button
                    onClick={() => {
                      navigate('/shop');
                      setSelectedBrand('all');
                      setSelectedColor('all');
                      const newParams = new URLSearchParams();
                      setSearchParams(newParams);
                    }}
                    className="font-sans text-xs editorial-spacing underline uppercase"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Shop;
