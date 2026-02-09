import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const editorials = [
  {
    title: "The Art of the Hand-Embroidered Gown",
    subtitle: "Inside Dar Al Arous' Beirut Atelier",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    category: "Craft",
  },
  {
    title: "Morocco's New Guard of Fashion",
    subtitle: "How Maison Noor is Redefining the Caftan",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
    category: "Culture",
  },
  {
    title: "Living with Levantine Design",
    subtitle: "Khalil Atelier's Vision for the Modern Home",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
    category: "Interior",
  },
];

const EditorialSection = () => {
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 max-w-[1440px] mx-auto">
      <div className="flex items-end justify-between mb-16">
        <div>
          <p className="font-sans text-xs editorial-spacing text-muted-foreground mb-4">
            Editorial
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-foreground">
            Stories & Craft
          </h2>
        </div>
        <button className="hidden md:flex items-center gap-2 font-sans text-xs editorial-spacing text-muted-foreground hover:text-foreground transition-colors">
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {editorials.map((article, index) => (
          <motion.article
            key={article.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="group cursor-pointer"
          >
            <div className="relative aspect-[4/3] overflow-hidden mb-5">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <p className="font-sans text-xs editorial-spacing text-accent mb-2">
              {article.category}
            </p>
            <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-2">
              {article.title}
            </h3>
            <p className="font-sans text-sm text-muted-foreground">
              {article.subtitle}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
};

export default EditorialSection;
