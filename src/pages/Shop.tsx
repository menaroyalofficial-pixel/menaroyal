import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/product/ProductCard";
import { productService } from "@/services/productService";
import { brandService } from "@/services/brandService";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

const Shop = () => {
  const { category: categorySlug } = useParams<{ category?: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedColor, setSelectedColor] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");

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
        const activeCat = categories.find(c => c.id === categorySlug);

        const data = await productService.getProducts({
          categoryId: activeCat?.id || categorySlug,
          brandId: selectedBrand,
          sortBy: sortBy
        });

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

    if (categories.length > 0) {
      fetchProducts();
    }
  }, [categorySlug, selectedBrand, selectedColor, sortBy, categories]);

  const activeCategory = categories.find((c) => c.id === categorySlug);

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        {/* Header */}
        <div className="pt-32 pb-16 border-b border-border">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
            <div className="flex flex-col items-center text-center">
              <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-6 uppercase tracking-[0.3em]">
                {activeCategory ? "Institutional Archive" : "Global Collection"}
              </p>
              <h1 className="font-serif text-5xl lg:text-8xl font-light text-foreground tracking-tighter capitalize">
                {activeCategory ? activeCategory.name : "The Archive"}
              </h1>
              {activeCategory && (
                <p className="font-sans text-[10px] text-muted-foreground mt-8 max-w-xl mx-auto leading-relaxed editorial-spacing font-light uppercase opacity-60">
                  {activeCategory.description}
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
                className={`font-sans text-[10px] editorial-spacing whitespace-nowrap transition-all duration-300 pb-1 border-b ${!categorySlug ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground hover:border-foreground/30"
                  }`}
              >
                ALL EXHIBITS
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop/${cat.id}`}
                  className={`font-sans text-[10px] editorial-spacing whitespace-nowrap transition-all duration-300 pb-1 border-b ${categorySlug === cat.id ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground hover:border-foreground/30"
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
                        className={`w-full aspect-square border border-border group relative`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {selectedColor === color.value && (
                          <div className="absolute inset-0 border-2 border-foreground mix-blend-difference" />
                        )}
                        <div className="absolute inset-x-0 -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                          <span className="font-sans text-[7px] editorial-spacing bg-white px-2 py-1 border border-border shadow-sm">{color.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Mechanism */}
                <div className="space-y-8 pt-12 border-t border-border">
                  <h3 className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase opacity-40">Curation Logic</h3>
                  <div className="relative group">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-transparent font-sans text-[11px] editorial-spacing text-foreground outline-none cursor-pointer appearance-none pr-8 py-2 border-b border-border hover:border-foreground transition-all"
                    >
                      <option value="featured">EDITORIAL CURATION</option>
                      <option value="newest">RECENT ARCHIVE</option>
                      <option value="price-asc">VALUE: LOW TO HIGH</option>
                      <option value="price-desc">VALUE: HIGH TO LOW</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-3 w-3 h-3 text-muted-foreground pointer-events-none group-hover:text-foreground transition-colors" />
                  </div>
                </div>

                {/* Aesthetic Guidelines */}
                <div className="pt-12 border-t border-border">
                  <p className="font-sans text-[9px] text-muted-foreground italic leading-relaxed uppercase editorial-spacing opacity-50">
                    Each piece in the MENA ROYAL collection is verified for regional heritage and contemporary artisanal standards.
                  </p>
                </div>
              </div>
            </aside>

            {/* Product Gallery */}
            <div className="lg:col-span-9">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-24">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="animate-pulse space-y-6">
                        <div className="aspect-[3/4] bg-secondary/20" />
                        <div className="h-4 bg-secondary/10 w-2/3" />
                        <div className="h-3 bg-secondary/10 w-1/3" />
                      </div>
                    ))
                  ) : (
                    products.map((product, index) => (
                      <ProductCard key={product.id} product={product} index={index} />
                    ))
                  )}
                </AnimatePresence>
              </div>

              {!loading && products.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-60 border border-dashed border-border flex flex-col items-center justify-center bg-secondary/5"
                >
                  <p className="font-serif text-2xl italic text-muted-foreground mb-8">No heritage pieces found in the selected archive.</p>
                  <button
                    onClick={() => { setSelectedBrand("all"); navigate("/shop"); }}
                    className="font-sans text-[10px] editorial-spacing text-foreground border-b border-foreground pb-1 hover:opacity-60 transition-opacity"
                  >
                    RESET DISCOVERY
                  </button>
                </motion.div>
              )}

              {/* Counter */}
              {!loading && products.length > 0 && (
                <div className="mt-40 pt-16 border-t border-border flex justify-between items-center text-muted-foreground">
                  <p className="font-sans text-[9px] editorial-spacing uppercase">
                    ARCHIVE COUNT: {products.length} EXHIBITS
                  </p>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="font-sans text-[9px] editorial-spacing hover:text-foreground transition-all border-b border-transparent hover:border-foreground pb-1"
                  >
                    BACK TO TOP
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Shop;
