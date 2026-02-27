import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCcw, Heart, ShoppingBag } from "lucide-react";
import { storyService, Story } from "@/services/storyService";
import { productService } from "@/services/productService";

const EditorialDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [article, setArticle] = useState<Story | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchArticle();
    }, [id]);

    const fetchArticle = async () => {
        setLoading(true);
        try {
            const data = await storyService.getStoryById(id!);
            setArticle(data);

            // Fetch a few products for the "Curated Archive" inline section
            const { products } = await productService.getProducts({ pageSize: 3 });
            setRelatedProducts(products);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <Layout>
            <div className="min-h-screen bg-white flex items-center justify-center">
                <RefreshCcw className="w-8 h-8 animate-spin opacity-20" />
            </div>
        </Layout>
    );

    if (!article) return (
        <Layout>
            <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-8">
                <p className="font-serif text-2xl italic text-muted-foreground">Archive entry not found.</p>
                <Link to="/editorial" className="font-sans text-[10px] editorial-spacing border-b border-black uppercase">Return to Index</Link>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="bg-white min-h-screen selection:bg-black selection:text-white pb-32">
                {/* Cinematic Header — No Image First */}
                <header className="pt-48 lg:pt-64 max-w-[1440px] mx-auto px-6 lg:px-12 text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5 }}
                        className="space-y-12"
                    >
                        <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase tracking-[0.5em]">
                            {article.category} // {article.read_time}
                        </p>
                        <h1 className="font-serif text-6xl lg:text-[9rem] font-light leading-[0.85] tracking-tighter text-black uppercase italic">
                            {article.title}
                        </h1>
                        <p className="font-sans text-xs lg:text-sm text-muted-foreground uppercase tracking-[0.3em] font-light max-w-2xl mx-auto leading-relaxed editorial-spacing">
                            {article.subtitle}
                        </p>
                    </motion.div>
                </header>

                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mb-32">
                    <div className="aspect-[21/9] overflow-hidden bg-secondary relative">
                        <motion.img
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.5 }}
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover grayscale contrast-125 brightness-95"
                        />
                    </div>
                </div>

                {/* Editorial Body */}
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
                        {/* Meta Sidebar */}
                        <div className="lg:col-span-3 lg:sticky lg:top-48 space-y-16 py-8 border-t border-black/5">
                            <div className="space-y-4">
                                <p className="font-sans text-[8px] editorial-spacing text-muted-foreground uppercase tracking-[0.3em]">Institutional Record No.</p>
                                <p className="font-sans text-[11px] tracking-widest">{article.id.substring(0, 8).toUpperCase()}</p>
                            </div>
                            <div className="space-y-4">
                                <p className="font-sans text-[8px] editorial-spacing text-muted-foreground uppercase tracking-[0.3em]">Date of Entry</p>
                                <p className="font-sans text-[11px] tracking-widest">{new Date(article.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="space-y-4 pt-12 border-t border-black/5">
                                <p className="font-sans text-[8px] editorial-spacing text-muted-foreground uppercase tracking-[0.3em]">Contributors</p>
                                <p className="font-serif text-lg italic">MENA ROYAL <br /> COLLECTIVE</p>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="lg:col-span-1" />

                        <div className="lg:col-span-7 py-8 border-t border-black/5">
                            <article className="prose-editorial">
                                <div className="font-sans text-lg lg:text-2xl text-black/80 leading-[1.8] font-light first-letter:text-[10rem] first-letter:font-serif first-letter:mr-6 first-letter:float-left first-letter:text-black first-letter:leading-[0.85] first-letter:italic whitespace-pre-line mb-24">
                                    {article.content}
                                </div>

                                {/* Pull Quote Example (Simulated since DB might not have one) */}
                                <blockquote className="my-24 py-12 border-t border-b border-black/5 text-center px-12">
                                    <p className="font-serif text-3xl lg:text-5xl italic font-light tracking-tighter text-black leading-tight">
                                        "Craftsmanship is the only language that honors heritage without needing a translator."
                                    </p>
                                </blockquote>

                                {/* Editorial to Commerce: The Curated Archive */}
                                <div className="my-32 pt-24 border-t border-black/5">
                                    <p className="font-sans text-[9px] editorial-spacing text-muted-foreground uppercase tracking-[0.4em] mb-12 text-center">Reference Archives</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                        {relatedProducts.map(product => (
                                            <Link to={`/product/${product.slug}`} key={product.id} className="group">
                                                <div className="aspect-[3/4] overflow-hidden mb-6 bg-secondary/10">
                                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover grayscale brightness-95 group-hover:scale-105 transition-transform duration-700" />
                                                </div>
                                                <div className="text-center space-y-2">
                                                    <p className="font-sans text-[8px] uppercase tracking-widest text-muted-foreground">{product.brands?.name}</p>
                                                    <h4 className="font-serif text-sm font-light uppercase group-hover:italic transition-all">{product.name}</h4>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="mt-16 text-center">
                                        <Link to="/shop" className="font-sans text-[10px] editorial-spacing border-b border-black pb-1 hover:opacity-50 transition-all uppercase tracking-widest">
                                            View Full Archive
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>

                {/* Footer Navigation */}
                <footer className="mt-48 max-w-[1440px] mx-auto px-6 lg:px-12">
                    <div className="pt-24 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-12">
                        <Link to="/editorial" className="font-sans text-[10px] editorial-spacing hover:opacity-50 transition-all uppercase tracking-[0.3em]">
                            ← Back to Archive Index
                        </Link>
                        <p className="font-sans text-[8px] text-muted-foreground uppercase tracking-[0.4em]">
                            MENA ROYAL INSTITUTIONAL DISPATCH // 2026
                        </p>
                    </div>
                </footer>
            </div>

            {/* Global Restraint Frame */}
            <div className="fixed inset-0 pointer-events-none border-[40px] border-white z-[100] hidden lg:block opacity-50" />
        </Layout>
    );
};

export default EditorialDetail;
