import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";

const editorialContent = [
  {
    title: "The Art of the Hand-Embroidered Gown",
    subtitle: "Inside Dar Al Arous' Beirut Atelier",
    excerpt: "In a sunlit workshop overlooking Beirut's corniche, master embroiderers practice techniques that have been passed down through generations. Each gown requires over 400 hours of meticulous handwork, transforming raw silk into wearable art that tells the story of Lebanon's rich textile heritage.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    category: "Craft",
    readTime: "8 min read",
  },
  {
    title: "Morocco's New Guard of Fashion",
    subtitle: "How Maison Noor is Redefining the Caftan",
    excerpt: "The caftan has been a symbol of Moroccan identity for centuries. Now, a new generation of designers is taking this iconic garment and reimagining it for the global stage. Maison Noor leads this movement, blending traditional sfifa embroidery with contemporary silhouettes.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80",
    category: "Culture",
    readTime: "6 min read",
  },
  {
    title: "Living with Levantine Design",
    subtitle: "Khalil Atelier's Vision for the Modern Home",
    excerpt: "The boundaries between art and furniture dissolve in Rami Khalil's Amman workshop. Here, geometric patterns inspired by Islamic architecture become functional objects — tables that serve as sculptures, shelves that double as installations.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80",
    category: "Interior",
    readTime: "10 min read",
  },
];

const Stories = () => {
  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="pt-32 pb-24 border-b border-border">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
            <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-6 uppercase tracking-[0.3em]">
              The Journal
            </p>
            <h1 className="font-serif text-5xl lg:text-8xl font-light text-foreground tracking-tighter">
              The <span className="italic">Journal</span>
            </h1>
            <p className="font-sans text-xs text-muted-foreground mt-8 max-w-xl mx-auto leading-relaxed editorial-spacing font-light">
              Deep dives into the heritage, craftsmanship, and institutional vision behind MENA's most remarkable luxury houses.
            </p>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-32">
          <div className="grid grid-cols-1 gap-48">
            {editorialContent.map((article, index) => (
              <motion.article
                key={article.title}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="group cursor-pointer"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
                  <div className={`lg:col-span-7 relative overflow-hidden aspect-[16/10] bg-secondary/20 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-[3s] ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  </div>

                  <div className={`lg:col-span-5 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                    <div className="space-y-10">
                      <div className="flex items-center gap-6">
                        <span className="font-sans text-[10px] editorial-spacing text-muted-foreground">
                          {article.category}
                        </span>
                        <span className="w-10 h-[1px] bg-border" />
                        <span className="font-sans text-[10px] editorial-spacing text-muted-foreground/40">
                          {article.readTime}
                        </span>
                      </div>

                      <div className="space-y-6">
                        <h2 className="font-serif text-4xl lg:text-5xl font-light text-foreground tracking-tight leading-tight group-hover:italic transition-all duration-700">
                          {article.title}
                        </h2>
                        <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase opacity-60">
                          {article.subtitle}
                        </p>
                      </div>

                      <p className="font-sans text-sm text-foreground/70 leading-relaxed font-light first-letter:text-4xl first-letter:font-serif first-letter:mr-2 first-letter:float-left">
                        {article.excerpt}
                      </p>

                      <div className="pt-4">
                        <span className="font-sans text-[10px] editorial-spacing text-foreground border-b border-foreground/30 pb-2 group-hover:border-foreground transition-all">
                          Read Full Journal
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Stories;
