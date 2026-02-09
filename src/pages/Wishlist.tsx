import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/product/ProductCard";
import { useStore } from "@/contexts/StoreContext";
import { products } from "@/data/mockData";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

const Wishlist = () => {
  const { wishlist } = useStore();

  const wishlistProducts = products.filter((p) =>
    wishlist.some((w) => w.productId === p.id)
  );

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        {/* Header */}
        <div className="pt-32 pb-24 border-b border-border">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
            <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-6 uppercase tracking-[0.3em]">
              The Curation
            </p>
            <h1 className="font-serif text-5xl lg:text-8xl font-light text-foreground tracking-tighter">
              Private <span className="italic">Wishlist</span>
            </h1>
            <p className="font-sans text-[10px] text-muted-foreground mt-8 editorial-spacing uppercase opacity-60">
              {wishlistProducts.length} {wishlistProducts.length === 1 ? "POSITION" : "POSITIONS"} ARCHIVED
            </p>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-32">
          {wishlistProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-24">
              {wishlistProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-40 bg-secondary/5 border border-dashed border-border"
            >
              <Heart className="w-12 h-12 text-muted-foreground/20 mx-auto mb-8 stroke-[1px]" />
              <h2 className="font-serif text-3xl font-light text-foreground mb-4 italic">Empty Archive</h2>
              <p className="font-sans text-xs text-muted-foreground mb-12 max-w-xs mx-auto leading-relaxed editorial-spacing font-light">
                Your private curation is currently empty. Discover heritage and contemporary craft in our collections.
              </p>
              <Link
                to="/shop"
                className="group relative font-sans text-[10px] editorial-spacing px-12 py-5 overflow-hidden inline-block"
              >
                <span className="relative z-10 text-white group-hover:text-black transition-colors duration-500 uppercase tracking-[0.3em]">Explore Exhibits</span>
                <div className="absolute inset-0 bg-black scale-x-100 group-hover:scale-x-0 transition-transform duration-500 origin-right" />
                <div className="absolute inset-0 border border-black" />
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Wishlist;
