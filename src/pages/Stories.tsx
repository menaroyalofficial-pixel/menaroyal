import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { storyService, Story } from "@/services/storyService";
import { RefreshCcw, ArrowRight } from "lucide-react";

const Editorial = () => {
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

  const heroStory = stories[0];
  const featuredStories = stories.slice(1, 4);
  const remainingStories = stories.slice(4);

  if (loading) return (
    <Layout>
      <div className="min-h-screen bg-white flex items-center justify-center">
        <RefreshCcw className="w-8 h-8 animate-spin opacity-20" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="bg-white min-h-screen selection:bg-black selection:text-white">
        {/* HERO ARTICLE — Full Bleed Cinematic */}
        {heroStory && (
          <section className="relative h-screen min-h-[700px] w-full overflow-hidden">
            <motion.div
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <img
                src={heroStory.image}
                alt={heroStory.title}
                className="w-full h-full object-cover grayscale brightness-75 contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
            </motion.div>

            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 lg:px-12 text-center text-white">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="max-w-5xl"
              >
                <p className="font-sans text-[10px] editorial-spacing mb-8 uppercase tracking-[0.5em] opacity-80">
                  The Featured Exhibit — {heroStory.category}
                </p>
                <h1 className="font-serif text-6xl lg:text-[10rem] font-light leading-[0.85] tracking-tighter mb-12 italic">
                  {heroStory.title}
                </h1>
                <Link
                  to={`/editorial/${heroStory.id}`}
                  className="inline-block font-sans text-[10px] editorial-spacing border-b border-white pb-2 hover:opacity-60 transition-all uppercase tracking-[0.3em]"
                >
                  Enter Narrative
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-32 lg:py-48">
          {/* THE EDIT — High-End Dispatch */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 mb-48 items-start">
            <div className="lg:col-span-4 sticky top-48">
              <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-8 uppercase tracking-[0.3em]">
                The Edit
              </p>
              <h2 className="font-serif text-5xl lg:text-7xl font-light leading-tight tracking-tighter italic">
                Curation <br /> of Heritage
              </h2>
              <div className="h-px w-24 bg-black/10 my-12" />
              <p className="font-sans text-xs text-muted-foreground uppercase tracking-widest leading-loose max-w-xs">
                Restrained analysis of Middle Eastern craftsmanship and the institutional vision behind the collective.
              </p>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-32">
              {featuredStories.map((article, idx) => (
                <Link to={`/editorial/${article.id}`} key={article.id} className="group">
                  <article className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="aspect-[4/3] overflow-hidden bg-secondary relative">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover grayscale brightness-90 group-hover:scale-105 transition-transform duration-1000"
                      />
                    </div>
                    <div className="space-y-6">
                      <p className="font-sans text-[9px] editorial-spacing text-muted-foreground uppercase tracking-widest">
                        {article.category} // {article.read_time}
                      </p>
                      <h3 className="font-serif text-3xl lg:text-4xl font-light group-hover:italic transition-all duration-500">
                        {article.title}
                      </h3>
                      <p className="font-sans text-xs text-muted-foreground leading-relaxed font-light line-clamp-2 uppercase tracking-widest editorial-spacing opacity-60">
                        {article.subtitle}
                      </p>
                      <div className="pt-4 flex items-center gap-4 text-black group-hover:gap-6 transition-all duration-500">
                        <span className="font-sans text-[10px] uppercase tracking-widest">Read Article</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          {/* THE ARCHIVE — Remaining Stories */}
          {remainingStories.length > 0 && (
            <div className="pt-32 border-t border-black/5">
              <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-24 text-center uppercase tracking-[0.4em]">
                Archival Records
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                {remainingStories.map((article) => (
                  <Link to={`/editorial/${article.id}`} key={article.id} className="group flex flex-col">
                    <div className="aspect-[16/10] overflow-hidden mb-8">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover grayscale brightness-95 group-hover:scale-105 transition-transform duration-1000"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-[9px] uppercase tracking-widest text-muted-foreground">{article.category}</span>
                        <span className="font-sans text-[9px] uppercase tracking-widest text-muted-foreground opacity-40">{article.read_time}</span>
                      </div>
                      <h3 className="font-serif text-2xl font-light group-hover:italic transition-all duration-500 uppercase">
                        {article.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Editorial;
