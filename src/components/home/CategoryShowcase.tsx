import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { productService } from "@/services/productService";
import { ChevronRight } from "lucide-react";

const CategoryShowcase = () => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      const data = await productService.getCategories();
      setCategories(data || []);
    };
    fetchCats();
  }, []);

  const getCategoryImage = (id: string) => {
    const images: Record<string, string> = {
      'bridal': "https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800&q=80",
      'abaya': '/sandstone-djellaba.jpg',
      'caftan': '/royal-velvet-caftan.jpg',
      'djellaba': '/sandstone-djellaba.jpg',
      'evening': "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&q=80",
      'maison': "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
      'jewelry': "https://images.unsplash.com/photo-1515562141589-67f0d569b4ae?w=800&q=80"
    };
    return images[id] || images['caftan'];
  };

  return (
    <section className="py-32 lg:py-48 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-8">
          <div className="max-w-xl">
            <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-6 uppercase tracking-[0.2em]">
              Institutional Departments
            </p>
            <h2 className="font-serif text-5xl lg:text-7xl font-light tracking-tighter text-foreground uppercase">
              The <span className="italic">Departments</span>
            </h2>
          </div>
          <Link to="/shop" className="font-sans text-[10px] editorial-spacing text-foreground border-b border-foreground pb-1 hover:opacity-60 transition-opacity uppercase">
            View All Collections
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to={`/shop/${category.id}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden mb-8 bg-secondary/10">
                  <img
                    src={getCategoryImage(category.id)}
                    alt={category.name}
                    className="w-full h-full object-cover grayscale brightness-90 transition-all duration-1000 ease-out group-hover:scale-105 group-hover:grayscale-0 group-hover:brightness-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-3xl font-light text-foreground uppercase tracking-tight">
                    {category.name}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-2 transition-transform duration-500" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
