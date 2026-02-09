import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { productService } from "@/services/productService";
import ProductCard from "@/components/product/ProductCard";

const FeaturedProducts = () => {
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await productService.getFeaturedProducts(4);
        setFeatured(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading || featured.length === 0) return null;

  return (
    <section className="py-32 lg:py-48 px-6 lg:px-12 max-w-[1440px] mx-auto overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
        <div>
          <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-6">
            Seasonal Curation
          </p>
          <h2 className="font-serif text-4xl lg:text-7xl font-light text-foreground tracking-tighter">
            The <span className="italic">Edit</span>
          </h2>
        </div>
        <Link
          to="/shop"
          className="font-sans text-[10px] editorial-spacing text-foreground border-b border-foreground pb-1 hover:opacity-60 transition-opacity"
        >
          View All Pieces
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        {featured.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
