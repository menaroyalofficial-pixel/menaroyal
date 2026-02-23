import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/product/ProductCard";
import { productService } from "@/services/productService";
import { useStore } from "@/contexts/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Minus, Plus, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getProductImage } from "@/utils/localImages";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const { addToCart, isInWishlist, addToWishlist, removeFromWishlist } = useStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await productService.getProductBySlug(slug);
        setProduct(data);

        if (data) {
          // Dynamic SEO Title
          document.title = `${data.name} | MENA ROYAL — Institutional Archive`;

          const { products: related } = await productService.getProducts({
            categoryId: data.category_id
          });
          setRelatedProducts(related?.filter((p: any) => p.id !== data.id).slice(0, 4) || []);
        }
      } catch (error) {
        console.error("Archive Detail Fetch Error:", error);
        toast.error("Failed to retrieve exhibit details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();

    return () => {
      document.title = "MENA ROYAL — The Authority on MENA Design";
    };
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center space-y-8">
          <Loader2 className="w-8 h-8 animate-spin text-foreground opacity-20" />
          <p className="font-sans text-[10px] editorial-spacing uppercase opacity-40">Opening Heritage Archive...</p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="pt-48 pb-40 text-center">
          <h1 className="font-serif text-2xl text-foreground italic mb-8">Exhibit Not Found in the Archive</h1>
          <Link to="/shop" className="font-sans text-[10px] editorial-spacing text-foreground border-b border-foreground/30 pb-1 hover:border-foreground transition-all uppercase">
            Browse Collection
          </Link>
        </div>
      </Layout>
    );
  }

  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor);
    toast.success(`${product.name} Added to Selection`);
  };

  const toggleWishlist = () => {
    if (wishlisted) {
      removeFromWishlist(product.id);
      toast.info("Removed from Private Collection");
    } else {
      addToWishlist(product.id);
      toast.success("Added to Private Collection");
    }
  };

  const mainImageSrc = slug ? getProductImage(slug, selectedImage) : null;

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        {/* Breadcrumb Navigation */}
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-6">
          <div className="flex items-center gap-4 text-[9px] font-sans editorial-spacing text-muted-foreground uppercase">
            <Link to="/" className="hover:text-foreground transition-all">Archive</Link>
            <span className="w-[1px] h-3 bg-border" />
            <Link to="/shop" className="hover:text-foreground transition-all">Collection</Link>
            <span className="w-[1px] h-3 bg-border" />
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

            {/* Immersive Gallery */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="lg:col-span-7"
            >
              <div className="aspect-[3/4] overflow-hidden bg-secondary/10 mb-8 relative group">
                <img
                  src={mainImageSrc || product.images?.[selectedImage] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                />
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`aspect-[3/4] overflow-hidden transition-all duration-700 ${i === selectedImage ? "opacity-100 ring-1 ring-foreground/20" : "opacity-40 hover:opacity-70"
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Exhibit Metadata & Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="lg:col-span-5 lg:py-4"
            >
              <div className="space-y-16">
                <div>
                  {product.brands && (
                    <Link
                      to={`/brand/${product.brands.slug}`}
                      className="font-sans text-[10px] editorial-spacing text-muted-foreground hover:text-foreground transition-all block mb-6 uppercase tracking-[0.2em]"
                    >
                      {product.brands.name}
                    </Link>
                  )}
                  <h1 className="font-serif text-5xl lg:text-7xl font-light text-foreground tracking-tighter leading-tight mb-8 uppercase">
                    {product.name}
                  </h1>
                  <p className="font-sans text-2xl font-light text-foreground/60 tracking-tighter">
                    $ {product.price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="border-t border-border pt-12">
                  <p className="font-sans text-[13px] text-foreground/70 leading-relaxed font-light first-letter:text-4xl first-letter:font-serif first-letter:mr-2 first-letter:float-left first-letter:text-foreground">
                    {product.description || "An exceptional artisanal exhibit joining the MENA ROYAL collective archive."}
                  </p>
                </div>

                <div className="space-y-12">
                  {/* Artisanal Specifications */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="space-y-8">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase">Heritage Sizing</h3>
                        <button className="font-sans text-[9px] editorial-spacing text-muted-foreground border-b border-border hover:text-foreground transition-colors uppercase">View Guide</button>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {product.sizes.map((size: string) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`font-sans text-[10px] editorial-spacing w-14 h-14 flex items-center justify-center border transition-all duration-700 ${selectedSize === size
                              ? "border-foreground bg-black text-white"
                              : "border-border text-foreground/40 hover:border-foreground hover:text-foreground"
                              }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-8 border-t border-border pt-12">
                    <div className="flex gap-4">
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 group relative font-sans text-[10px] editorial-spacing py-6 overflow-hidden"
                      >
                        <span className="relative z-10 text-white group-hover:text-black transition-colors duration-500 uppercase">Acquire for Archive</span>
                        <div className="absolute inset-0 bg-black scale-x-100 group-hover:scale-x-0 transition-transform duration-700 origin-right" />
                        <div className="absolute inset-0 border border-black" />
                      </button>
                      <button
                        onClick={toggleWishlist}
                        className={`px-8 border transition-all duration-700 ${wishlisted ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                          }`}
                        aria-label={wishlisted ? "Remove from collection" : "Add to collection"}
                      >
                        <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    <p className="font-sans text-[9px] text-muted-foreground italic text-center uppercase editorial-spacing opacity-50">
                      Standard delivery within 14-21 business days for artisanal tailoring.
                    </p>
                  </div>
                </div>

                {/* Institutional Details */}
                <div className="pt-16 border-t border-border grid grid-cols-2 gap-12">
                  <div>
                    <h3 className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-6 uppercase">Materials</h3>
                    <p className="font-sans text-[10px] text-foreground leading-relaxed uppercase tracking-[0.2em] opacity-80">
                      {product.materials?.join(" / ") || "AUTHENTIC HERITAGE OUTFIT"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-6 uppercase">Provenance</h3>
                    <p className="font-sans text-[10px] text-muted-foreground leading-relaxed uppercase tracking-[0.2em] opacity-50 italic">
                      Crafted at the House of<br />{product.brands?.name || "MENA ROYAL"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related Exhibits */}
          {relatedProducts.length > 0 && (
            <div className="mt-40 lg:mt-60 border-t border-border pt-32">
              <div className="flex flex-col items-center text-center mb-24">
                <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-6 uppercase tracking-[0.3em]">Curation Continued</p>
                <h2 className="font-serif text-5xl lg:text-7xl font-light text-foreground tracking-tighter uppercase">The <span className="italic">Selection</span></h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                {relatedProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
