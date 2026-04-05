import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { storyService } from "@/services/storyService";
import { productService } from "@/services/productService";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft } from "lucide-react";

const EditorialDetail = () => {
    const { id: slug } = useParams<{ id: string }>();

    const { data: story, isLoading: storyLoading } = useQuery({
        queryKey: ["editorial-story", slug],
        queryFn: () => storyService.getStoryBySlug(slug!),
        enabled: !!slug,
    });

    const { data: taggedProducts = [], isLoading: productsLoading } = useQuery({
        queryKey: ["editorial-products", story?.product_tags],
        queryFn: () => productService.getProductsByIds(story?.product_tags || []),
        enabled: !!story?.product_tags?.length,
    });

    const { data: moreStories = [] } = useQuery({
        queryKey: ["more-editorial"],
        queryFn: () => storyService.getAllStories(),
        select: (data) => data.filter(s => s.slug !== slug).slice(0, 3)
    });

    if (storyLoading) {
        return (
            <Layout>
                <div className="min-h-screen bg-white flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-black/20" />
                </div>
            </Layout>
        );
    }

    if (!story) return (
        <Layout>
            <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-8">
                <p className="font-serif text-2xl italic text-muted-foreground uppercase tracking-widest">Entry Lost in Archive</p>
                <Link to="/editorial" className="font-sans text-[10px] editorial-spacing border-b border-black uppercase pb-1">Return to Index</Link>
            </div>
        </Layout>
    );

    // Simple parser for pull quotes and content
    const renderContent = (content: string) => {
        return content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('>')) {
                return (
                    <blockquote key={index} className="my-12 lg:my-24 py-12 border-t border-b border-[#99815D]/20 text-center px-6 lg:px-12">
                        <p className="font-serif text-3xl md:text-4xl lg:text-5xl italic font-light tracking-tighter text-black leading-tight">
                            "{paragraph.replace('>', '').trim()}"
                        </p>
                    </blockquote>
                );
            }
            return (
                <p key={index} className="font-sans text-lg lg:text-xl text-black/80 leading-[1.8] font-light mb-12 last:mb-0">
                    {index === 0 ? (
                        <>
                            <span className="text-6xl md:text-8xl lg:text-[8rem] font-serif mr-6 float-left text-black leading-[0.85] italic">
                                {paragraph.charAt(0)}
                            </span>
                            {paragraph.slice(1)}
                        </>
                    ) : paragraph}
                </p>
            );
        });
    };

    return (
        <Layout>
            <div className="bg-white min-h-screen selection:bg-black selection:text-white overflow-x-hidden">
                {/* Back Link */}
                <div className="fixed top-32 left-8 lg:left-12 z-20">
                    <Link to="/editorial" className="group flex items-center gap-4 font-sans text-[9px] tracking-[0.4em] text-black opacity-30 hover:opacity-100 transition-all uppercase">
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
                        Index
                    </Link>
                </div>

                {/* HERO SECTION — Cinematic Scale */}
                <header className="relative h-screen w-full overflow-hidden bg-black">
                    <motion.div
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0"
                    >
                        <img
                            src={story.image}
                            alt={story.title}
                            className="w-full h-full object-cover grayscale contrast-125 brightness-75"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
                    </motion.div>

                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 px-6 lg:px-12 text-center text-white">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.5, delay: 0.8 }}
                            className="max-w-6xl space-y-12"
                        >
                            <h1 className="font-serif text-4xl md:text-6xl lg:text-[8rem] font-light leading-[0.85] tracking-tighter uppercase italic">
                                {story.title}
                            </h1>
                        </motion.div>
                    </div>
                </header>

                <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-32 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 relative">
                    {/* META COLUMN — Silver & Understated */}
                    <div className="lg:col-span-3 lg:sticky lg:top-48 h-fit space-y-16 py-8 border-t border-black/10">
                        <div className="space-y-4">
                            <p className="font-sans text-[8px] editorial-spacing text-[#BFBFBF] uppercase tracking-[0.4em]">Archival Classification</p>
                            <p className="font-sans text-[11px] tracking-widest text-black/60 uppercase">{story.category}</p>
                        </div>
                        <div className="space-y-4">
                            <p className="font-sans text-[8px] editorial-spacing text-[#BFBFBF] uppercase tracking-[0.4em]">Curated On</p>
                            <p className="font-sans text-[11px] tracking-widest text-black/60 uppercase">{new Date(story.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="space-y-4">
                            <p className="font-sans text-[8px] editorial-spacing text-[#BFBFBF] uppercase tracking-[0.4em]">Audit Duration</p>
                            <p className="font-sans text-[11px] tracking-widest text-black/60 uppercase">{story.read_time}</p>
                        </div>
                        <div className="space-y-4 pt-12 border-t border-black/10">
                            <p className="font-sans text-[8px] editorial-spacing text-[#BFBFBF] uppercase tracking-[0.4em]">Institution</p>
                            <p className="font-serif text-lg italic uppercase text-black/40">MENA ROYAL Collective</p>
                        </div>
                    </div>

                    <div className="lg:col-span-1" />

                    {/* CONTENT COLUMN — Magazine Spacing */}
                    <div className="lg:col-span-8 flex flex-col">
                        <div className="mb-24">
                            <p className="font-serif text-3xl lg:text-5xl text-black/60 font-light italic leading-relaxed tracking-tighter mb-24">
                                "{story.subtitle}"
                            </p>
                            <div className="prose-editorial">
                                {renderContent(story.content)}
                            </div>
                        </div>

                        {/* INLINE PRODUCT CARDS — Archive Integration */}
                        {taggedProducts.length > 0 && (
                            <div className="my-32 space-y-12 py-24 border-t border-b border-black/5">
                                <p className="font-sans text-[10px] tracking-[0.5em] text-[#99815D] uppercase text-center mb-16">Reference Archive Items</p>
                                <div className="space-y-8">
                                    {taggedProducts.map((product) => (
                                        <div key={product.id} className="flex flex-col md:flex-row gap-12 items-center bg-secondary/5 border border-black/5 group hover:border-[#99815D]/30 transition-all duration-700">
                                            <div className="w-full md:w-64 aspect-[3/4] overflow-hidden grayscale contrast-125 group-hover:grayscale-0 transition-all duration-1000">
                                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 p-8 lg:p-12 space-y-8">
                                                <div className="space-y-2">
                                                    <p className="font-sans text-[9px] tracking-[0.3em] text-black/40 uppercase">{product.brands?.name}</p>
                                                    <h4 className="font-serif text-3xl lg:text-4xl font-light uppercase tracking-tighter">{product.name}</h4>
                                                    <p className="font-sans text-lg tracking-tighter text-black/60">
                                                        $ {product.price.toLocaleString()}
                                                    </p>
                                                </div>
                                                <Link to={`/product/${product.slug}`} className="inline-block font-sans text-[10px] tracking-[0.5em] border-b border-black pb-1 hover:text-[#99815D] hover:border-[#99815D] transition-all uppercase">
                                                    View in Archive
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* MORE FROM THE EDIT — Grid Footer */}
                <footer className="max-w-[1440px] mx-auto px-6 lg:px-12 py-32 border-t border-black/10">
                    <p className="font-sans text-[10px] tracking-[0.6em] text-black/20 uppercase text-center mb-24">More from The Edit</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
                        {moreStories.map((s) => (
                            <Link key={s.id} to={`/editorial/${s.slug}`} className="group space-y-8 block">
                                <div className="aspect-[4/5] overflow-hidden bg-secondary relative">
                                    <img src={s.image} alt={s.title} className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-[2s] group-hover:scale-105" />
                                </div>
                                <div className="space-y-4">
                                    <span className="font-sans text-[9px] tracking-[0.4em] text-[#99815D] uppercase font-bold">{s.category}</span>
                                    <h5 className="font-serif text-2xl font-light uppercase tracking-tight group-hover:italic transition-all duration-500">{s.title}</h5>
                                </div>
                            </Link>
                        ))}
                    </div>
                </footer>
            </div>
        </Layout>
    );
};

export default EditorialDetail;
