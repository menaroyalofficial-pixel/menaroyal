import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/product/ProductCard";
import { brandService } from "@/services/brandService";
import { productService } from "@/services/productService";
import { motion } from "framer-motion";
import { MapPin, Loader2 } from "lucide-react";

const BrandPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [brand, setBrand] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandData = async (isLoadMore = false) => {
      if (!slug) return;
      if (!isLoadMore) setLoading(true);

      try {
        const brandData = await brandService.getBrandBySlug(slug);
        setBrand(brandData);

        if (brandData) {
          // Dynamic SEO Title
          document.title = `${brandData.name} | MENA ROYAL — Institutional Archive`;

          const { products: fetchedProducts } = await productService.getProducts({
            brandId: brandData.id,
            page: isLoadMore ? Math.floor(products.length / 24) + 1 : 1,
            pageSize: 24
          });

          if (isLoadMore) {
            setProducts(prev => [...prev, ...fetchedProducts]);
          } else {
            setProducts(fetchedProducts || []);
          }
        }
      } catch (error) {
        console.error("Archive House Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrandData();

    return () => {
      document.title = "MENA ROYAL — The Authority on MENA Design";
    };
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center space-y-8">
          <Loader2 className="w-8 h-8 animate-spin text-foreground opacity-20" />
          <p className="font-sans text-[10px] editorial-spacing uppercase opacity-40">Opening House Archives...</p>
        </div>
      </Layout>
    );
  }

  if (!brand) {
    return (
      <Layout>
        <div className="pt-48 pb-40 text-center">
          <h1 className="font-serif text-2xl text-foreground italic mb-8">House Registry Not Found</h1>
          <Link to="/designers" className="font-sans text-[10px] editorial-spacing text-foreground border-b border-foreground/30 pb-1 hover:border-foreground transition-all uppercase">
            Directory of Houses
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        {/* Immersive Hero */}
        <div className="relative h-[80vh] overflow-hidden">
          <motion.img
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            src={brand.cover_image || brand.logo || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000"}
            alt={brand.name}
            className="w-full h-full object-cover grayscale brightness-[0.7] contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="font-sans text-[10px] editorial-spacing text-white/50 mb-8 flex items-center justify-center gap-3 uppercase tracking-[0.4em]">
                  <MapPin className="w-3 h-3 text-white/30" /> {brand.country || "MENA"}
                </p>
                <h1 className="font-serif text-6xl lg:text-9xl font-light text-white tracking-widest uppercase mb-12">
                  {brand.name}
                </h1>
                <div className="h-[1px] w-24 bg-white/20 mx-auto" />
              </motion.div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-32">
          {/* House Narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32 mb-48 items-start">
            <div className="lg:col-span-5 sticky top-48">
              <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-8 uppercase tracking-[0.25em]">
                The Heritage
              </p>
              <h2 className="font-serif text-4xl lg:text-6xl font-light leading-[1.1] text-foreground tracking-tighter uppercase">
                Archiving<br /><span className="italic">Craftsmanship</span>
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="font-sans text-xl lg:text-2xl text-foreground/80 font-light leading-relaxed first-letter:text-6xl first-letter:font-serif first-letter:mr-4 first-letter:float-left first-letter:text-foreground">
                {brand.story || brand.description || "The history of this house is being meticulously archived for the MENA ROYAL collective."}
              </p>
            </div>
          </div>

          {/* House Exhibition */}
          <div className="border-t border-border pt-32">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-8">
              <div>
                <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-4 uppercase tracking-[0.2em]">
                  Seasonal Selection
                </p>
                <h2 className="font-serif text-5xl lg:text-7xl font-light tracking-tighter uppercase">
                  The <span className="italic">Collection</span>
                </h2>
              </div>
              <p className="font-sans text-[10px] text-muted-foreground uppercase editorial-spacing opacity-50">
                Displaying {products.length} Curated Exhibits
              </p>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="py-40 text-center border border-dashed border-border rounded-lg">
                <p className="font-serif text-2xl italic text-muted-foreground">The house collection is currently under archival review.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BrandPage;
