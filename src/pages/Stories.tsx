import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { storyService, Story } from "@/services/storyService";
import { RefreshCcw } from "lucide-react";

const Stories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const data = await storyService.getAllStories();
      setStories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
          {loading ? (
            <div className="py-40 text-center">
              <RefreshCcw className="w-8 h-8 animate-spin mx-auto opacity-20" />
            </div>
          ) : stories.length === 0 ? (
            <div className="py-40 text-center border border-dashed border-border bg-secondary/5">
              <p className="font-serif text-2xl italic text-muted-foreground">The archive is being curated. Return shortly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-48">
              {stories.map((article, index) => (
                <Link to={`/stories/${article.id}`} key={article.id}>
                  <motion.article
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
                              {article.read_time}
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

                          <p className="font-sans text-sm text-foreground/70 leading-relaxed font-light first-letter:text-4xl first-letter:font-serif first-letter:mr-2 first-letter:float-left line-clamp-4">
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
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Stories;
