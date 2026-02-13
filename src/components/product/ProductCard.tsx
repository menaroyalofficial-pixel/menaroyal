import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Product, formatPrice } from "@/data/mockData";
import { useStore } from "@/contexts/StoreContext";
import { motion } from "framer-motion";

import { getProductImage } from "@/utils/localImages";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useStore();
  const wishlisted = isInWishlist(product.id);
  const localSrc = getProductImage(product.slug);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    wishlisted ? removeFromWishlist(product.id) : addToWishlist(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.05 }}
    >
      <Link to={`/product/${product.slug}`} className="group block relative">
        <div className="relative aspect-[3/4] overflow-hidden bg-white mb-6">
          <img
            src={localSrc || product.images[0] || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />

          <button
            onClick={toggleWishlist}
            className="absolute top-4 right-4 p-2.5 transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-4 h-4 transition-all duration-300 ${wishlisted ? "fill-foreground text-foreground" : "text-foreground hover:scale-110"}`}
            />
          </button>
        </div>

        <div className="text-center space-y-2 px-4">
          <p className="font-sans text-[9px] text-muted-foreground editorial-spacing tracking-[0.25em] uppercase">
            {product.brands?.name || product.brandName || "Heritage House"}
          </p>
          <h3 className="font-serif text-lg font-light text-foreground tracking-tight line-clamp-1 uppercase">
            {product.name}
          </h3>
          <p className="font-sans text-xs font-medium text-foreground/80 mt-2">
            ${product.price}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
