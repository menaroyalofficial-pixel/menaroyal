import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { brandService } from "@/services/brandService";
import { motion, AnimatePresence } from "framer-motion";
import { normalizeCountry } from "../../shared/cryptoCountries";

const Designers = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const origin = searchParams.get("origin");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await brandService.getActiveBrands();
        setBrands(data || []);
      } catch (error) {
        console.error("Archive Directory Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    if (origin) {
      // "uae", "AE" and "United Arab Emirates" all mean the same country.
      const wanted = normalizeCountry(origin) ?? origin.toLowerCase();
      const same = (v?: string | null) => !!v && (normalizeCountry(v) ?? v.toLowerCase()) === wanted;
      setFilteredBrands(brands.filter(b => same(b.origin_country) || same(b.country)));
    } else {
      setFilteredBrands(brands);
    }
  }, [origin, brands]);

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="pt-32 pb-24 border-b border-border">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
            <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-6 uppercase tracking-[0.3em]">
              The Guild of Excellence
            </p>
            <h1 className="font-serif text-5xl lg:text-8xl font-light text-foreground tracking-tighter">
              The <span className="italic">Houses</span>
            </h1>
            <p className="font-sans text-xs text-muted-foreground mt-8 max-w-xl mx-auto leading-relaxed editorial-spacing font-light">
              A curated directory of the exceptional artisans and ateliers shaping the institutional landscape of Middle Eastern luxury.
            </p>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-32">
          {loading ? (
            <div className="space-y-48 animate-pulse">
              {[1, 2].map(i => (
                <div key={i} className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                  <div className="lg:col-span-7 aspect-[16/10] bg-secondary/20" />
                  <div className="lg:col-span-5 h-40 bg-secondary/10" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-48">
              <AnimatePresence>
                {filteredBrands.map((brand, index) => (
                  <motion.div
                    key={brand.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link to={`/brand/${brand.slug}`} className="group grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                      <div className={`lg:col-span-7 overflow-hidden bg-secondary/20 relative aspect-[16/10] ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                        <img
                          src={brand.cover_image || brand.logo || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"}
                          alt={brand.name}
                          className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100"
                        />
                        <div className="absolute inset-0 border-[20px] border-white/5 group-hover:border-white/0 transition-all duration-700" />
                      </div>

                      <div className={`lg:col-span-5 ${index % 2 === 1 ? "lg:order-1 lg:text-right" : ""}`}>
                        <div className={`space-y-8 ${index % 2 === 1 ? "lg:flex lg:flex-col lg:items-end" : ""}`}>
                          <p className="font-sans text-[10px] editorial-spacing text-muted-foreground flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-border" />
                            {brand.country || "MENA"} <span className="text-foreground/20">/</span> {brand.status?.toUpperCase()}
                          </p>
                          <h2 className="font-serif text-4xl lg:text-6xl font-light text-foreground tracking-tight group-hover:italic transition-all duration-700 uppercase">
                            {brand.name}
                          </h2>
                          <p className="font-sans text-xs text-muted-foreground leading-relaxed max-w-md editorial-spacing font-light">
                            {brand.description || "Archiving the cultural heritage of contemporary design."}
                          </p>
                          <div className="pt-4">
                            <span className="font-sans text-[9px] editorial-spacing text-foreground border-b border-foreground/30 pb-2 group-hover:border-foreground transition-all">
                              Explore the Heritage
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>

              {brands.length === 0 && (
                <div className="text-center py-40 border border-dashed border-border">
                  <p className="font-serif text-2xl italic text-muted-foreground">The guild archive is currently being updated.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Designers;
