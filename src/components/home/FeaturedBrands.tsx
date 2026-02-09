import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { brandService } from "@/services/brandService";

const FeaturedBrands = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await brandService.getActiveBrands();
        setBrands(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  if (loading) return null;
  if (brands.length === 0) return null;

  return (
    <section className="py-32 lg:py-48 px-6 lg:px-12 max-w-[1440px] mx-auto border-t border-border">
      <div className="flex flex-col items-center text-center mb-24">
        <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-6">
          The Guild
        </p>
        <h2 className="font-serif text-4xl lg:text-7xl font-light text-foreground tracking-tighter">
          The <span className="italic">Houses</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
        {brands.map((brand, index) => (
          <motion.div
            key={brand.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to={`/brand/${brand.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden mb-8 bg-secondary/20">
                <img
                  src={brand.cover_image || brand.logo || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000"}
                  alt={brand.name}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-3xl font-light text-foreground group-hover:italic transition-all duration-500">
                    {brand.name}
                  </h3>
                  <span className="font-sans text-[9px] editorial-spacing text-muted-foreground">{brand.country}</span>
                </div>
                <p className="font-sans text-xs text-muted-foreground leading-relaxed font-light line-clamp-2 uppercase tracking-wide">
                  {brand.description}
                </p>
                <div className="pt-2">
                  <span className="font-sans text-[9px] editorial-spacing text-foreground border-b border-foreground/30 pb-1 group-hover:border-foreground transition-colors">Discover the Heritage</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedBrands;
