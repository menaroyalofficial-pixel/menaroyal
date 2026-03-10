import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { storyService } from "@/services/storyService";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const Editorial = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["editorial-stories"],
    queryFn: () => storyService.getAllStories(),
  });

  const categories = Array.from(new Set(stories.map((s) => s.category)));

  const filteredStories = selectedCategory
    ? stories.filter(s => s.category === selectedCategory)
    : stories;

  const heroStory = stories[0];
  const gridStories = stories.slice(1, 4);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-black/20" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white min-h-screen selection:bg-black selection:text-white pb-32">
        {/* HERO STORY — Full Bleed & Clickable */}
        {heroStory && (
          <Link to={`/editorial/${heroStory.slug}`} className="block relative w-full h-[90vh] overflow-hidden group">
            <motion.div
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <img
                src={heroStory.image}
                alt={heroStory.title}
                className="w-full h-full object-cover grayscale brightness-75 contrast-125 transition-transform duration-[3s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
            </motion.div>

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 lg:p-12 text-center text-white">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="max-w-5xl space-y-8"
              >
                <p className="font-sans text-[10px] editorial-spacing tracking-[0.5em] uppercase opacity-80">
                  Featured — {heroStory.category}
                </p>
                <h1 className="font-serif text-6xl lg:text-[9rem] font-light leading-[0.85] tracking-tighter uppercase italic">
                  {heroStory.title}
                </h1>
              </motion.div>
            </div>
          </Link>
        )}

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24">
          {/* CATEGORY FILTER — Institutional Horizontal Scroll */}
          <div className="mb-24 overflow-x-auto no-scrollbar border-b border-black/5 pb-8 flex items-center gap-12 whitespace-nowrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`font-sans text-[10px] tracking-[0.4em] uppercase transition-all ${!selectedCategory ? "text-black border-b border-black" : "text-black/30 hover:text-black"
                } pb-2`}
            >
              All Records
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`font-sans text-[10px] tracking-[0.4em] uppercase transition-all ${selectedCategory === cat ? "text-black border-b border-black" : "text-black/30 hover:text-black"
                  } pb-2`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ASYMMETRIC GRID — 1 Large Left, 2 Smaller Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {gridStories[0] && (
              <div className="lg:col-span-8">
                <StoryCard story={gridStories[0]} size="large" />
              </div>
            )}
            <div className="lg:col-span-4 flex flex-col gap-12 lg:gap-16">
              {gridStories.slice(1).map((s) => (
                <StoryCard key={s.id} story={s} size="small" />
              ))}
            </div>
          </div>

          {/* REMAINING ARCHIVE */}
          {stories.length > 4 && (
            <div className="mt-32 pt-24 border-t border-black/5">
              <h3 className="font-serif text-3xl lg:text-4xl italic mb-16 opacity-20 uppercase tracking-widest text-center">Institutional Register</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                {stories.slice(4).map((s) => (
                  <StoryCard key={s.id} story={s} size="regular" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

const StoryCard = ({ story, size = "regular" }: { story: any, size?: "large" | "small" | "regular" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/editorial/${story.slug}`} className="group block space-y-6">
        <div className={`overflow-hidden bg-secondary/10 relative ${size === 'large' ? 'aspect-[16/10]' : size === 'small' ? 'aspect-video' : 'aspect-[4/5]'
          }`}>
          <img
            src={story.image}
            alt={story.title}
            className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-[2s] group-hover:scale-105"
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[9px] tracking-[0.4em] text-[#99815D] uppercase font-bold">
              {story.category}
            </span>
            <span className="font-sans text-[8px] tracking-[0.3em] text-black/40 uppercase">
              {story.read_time}
            </span>
          </div>
          <h3 className={`font-serif text-black leading-tight tracking-tighter group-hover:italic transition-all duration-500 uppercase ${size === 'large' ? 'text-4xl lg:text-6xl' : 'text-2xl lg:text-3xl'
            }`}>
            {story.title}
          </h3>
          {(size === 'large' || size === 'regular') && (
            <p className="font-sans text-[11px] leading-relaxed text-black/50 uppercase tracking-[0.1em] line-clamp-2 editorial-spacing font-light">
              {story.subtitle}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default Editorial;
