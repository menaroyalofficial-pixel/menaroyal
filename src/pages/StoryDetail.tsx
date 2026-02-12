import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { storyService, Story } from "@/services/storyService";

const StoryDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [article, setArticle] = useState<Story | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchArticle();
    }, [id]);

    const fetchArticle = async () => {
        setLoading(true);
        try {
            const data = await storyService.getStoryById(id!);
            setArticle(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <Layout>
            <div className="min-h-screen bg-background flex items-center justify-center">
                <RefreshCcw className="w-8 h-8 animate-spin opacity-20" />
            </div>
        </Layout>
    );

    if (!article) return (
        <Layout>
            <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-8">
                <p className="font-serif text-2xl italic text-muted-foreground">Archive entry not found.</p>
                <Link to="/stories" className="font-sans text-[10px] editorial-spacing border-b border-black">Return Home</Link>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="bg-background min-h-screen">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-32">
                    <Link to="/stories" className="group flex items-center gap-4 font-sans text-[10px] editorial-spacing text-muted-foreground hover:text-foreground transition-all">
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
                        RETURN TO ARCHIVE
                    </Link>
                </div>

                <article className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                        <div className="lg:col-span-3 space-y-12">
                            <div className="space-y-4">
                                <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase">Category</p>
                                <p className="font-serif text-xl italic font-light">{article.category}</p>
                            </div>
                            <div className="space-y-4">
                                <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase">Read Time</p>
                                <p className="font-sans text-[11px] editorial-spacing">{article.read_time.toUpperCase()}</p>
                            </div>
                            <div className="pt-12 border-t border-border">
                                <p className="font-sans text-[9px] editorial-spacing text-muted-foreground mb-4">SHARE ARCHIVE</p>
                                <div className="flex gap-4">
                                    {["TW", "IG", "FB"].map(s => (
                                        <span key={s} className="font-sans text-[10px] editorial-spacing text-foreground/40 hover:text-foreground cursor-pointer transition-colors">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-9 space-y-24">
                            <header className="space-y-12">
                                <div className="space-y-6">
                                    <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase tracking-[0.4em]">Journal Entry</p>
                                    <h1 className="font-serif text-5xl lg:text-8xl font-light text-foreground tracking-tighter leading-tight">
                                        {article.title}
                                    </h1>
                                </div>
                                <p className="font-serif text-2xl lg:text-3xl italic font-light text-foreground/60 leading-relaxed max-w-2xl">
                                    "{article.subtitle}"
                                </p>
                            </header>

                            <div className="aspect-[21/9] overflow-hidden bg-secondary relative">
                                <motion.img
                                    initial={{ scale: 1.1 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="max-w-3xl">
                                <div className="font-sans text-lg lg:text-xl text-foreground/80 leading-relaxed font-light first-letter:text-7xl first-letter:font-serif first-letter:mr-4 first-letter:float-left first-letter:text-foreground whitespace-pre-line prose-serif prose-lg">
                                    {article.content}
                                </div>
                            </div>

                            <footer className="pt-24 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <p className="font-sans text-[9px] editorial-spacing text-muted-foreground">CONTRIBUTOR</p>
                                        <p className="font-serif text-xl font-light">MENA ROYAL Collective</p>
                                    </div>
                                    <Link to="/stories" className="font-sans text-[10px] editorial-spacing border border-foreground px-8 py-4 hover:bg-black hover:text-white transition-all">
                                        RETURN TO CONCIERGE
                                    </Link>
                                </div>
                            </footer>
                        </div>
                    </div>
                </article>
            </div>
        </Layout>
    );
};

export default StoryDetail;
