import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, RefreshCcw } from "lucide-react";
import { storyService, Story } from "@/services/storyService";

const EditorialSection = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await storyService.getAllStories();
        setStories(data.slice(0, 3));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 max-w-[1440px] mx-auto border-t border-border">
      <div className="flex items-end justify-between mb-16">
        <div>
          <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-4 uppercase tracking-[0.3em]">
            Editorial
          </p>
          <h2 className="font-serif text-3xl lg:text-5xl font-light text-foreground">
            Stories & <span className="italic text-muted-foreground/40">Craft</span>
          </h2>
        </div>
        <Link to="/editorial" className="flex items-center gap-2 font-sans text-[10px] uppercase editorial-spacing text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-black">
          Examine Archive <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCcw className="w-6 h-6 animate-spin mx-auto opacity-10" />
        </div>
      ) : stories.length === 0 ? (
        <div className="py-20 text-center bg-secondary/5 border border-dashed border-border italic font-serif text-muted-foreground">
          Narratives currently under curation.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {stories.map((article, index) => (
            <Link to={`/editorial/${article.slug}`} key={article.id}>
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden mb-8 bg-secondary/10">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover grayscale transition-all duration-[2s] group-hover:grayscale-0 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                </div>
                <div className="space-y-4">
                  <p className="font-sans text-[8px] editorial-spacing text-muted-foreground uppercase">
                    {article.category}
                  </p>
                  <h3 className="font-serif text-xl lg:text-2xl font-light text-foreground group-hover:italic transition-all duration-500">
                    {article.title}
                  </h3>
                  <p className="font-sans text-[10px] text-muted-foreground uppercase opacity-40">
                    {article.subtitle}
                  </p>
                </div>
              </motion.article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default EditorialSection;
