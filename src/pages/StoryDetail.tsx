import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

// In a real app, this would come from a CMS or database
const articles = [
    {
        id: "1",
        title: "The Art of Embroidery",
        subtitle: "A journey through the Levant's oldest ateliers.",
        content: `For centuries, the skilled artisans of the Levant have passed down the secrets of intricate embroidery from generation to generation. Each stitch tells a story of heritage, identity, and meticulous craftsmanship. In our visit to the historic ateliers of Aleppo and Beirut, we witnessed the silent dedication of master embroiderers who continue to keep this ancient art alive.

The process is slow, deliberate, and deeply meditative. A single gown can take hundreds of hours of manual labor, as tiny beads and golden threads are woven into patterns that have remained unchanged for centuries. Yet, these traditional techniques are increasingly being merged with contemporary design sensibilities, resulting in a unique fusion of the old and the new.

Our mission at MENA ROYAL is to archive these narratives and provide a global stage for these unsung heroes of haute couture. We believe that true luxury lies in the hands of the creator and the soul of the craft.`,
        author: "Zaina Al-Mansour",
        date: "February 2026",
        image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: "2",
        title: "Gold and Geometry",
        subtitle: "Modernizing the traditional jewelry of Mascat.",
        content: `The jewelry of Oman is more than just adornment; it is a manifestation of mathematical precision and spiritual symbolism. The geometry of the desert—the patterns of the dunes, the alignment of the stars—is reflected in the gold and silver work of local craftsmen.

Today, a new wave of Omani designers is taking these traditional geometric motifs and reinterpreting them for a global, modern audience. By stripping away some of the heavier traditional elements and focusing on the purity of the lines, they are creating pieces that are both timeless and of the moment.

"We are not just making jewelry," says one designer. "We are translating our history into a language that the rest of the world can understand." Through these pieces, the golden heritage of Mascat continues to shine on an international stage.`,
        author: "Omar Bin Said",
        date: "January 2026",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?q=80&w=2070&auto=format&fit=crop"
    }
];

const StoryDetail = () => {
    const { id } = useParams<{ id: string }>();
    const article = articles.find(a => a.id === id) || articles[0];

    return (
        <Layout>
            <div className="bg-background min-h-screen">
                {/* Back Button */}
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-32">
                    <Link to="/stories" className="group flex items-center gap-4 font-sans text-[10px] editorial-spacing text-muted-foreground hover:text-foreground transition-all">
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
                        RETURN TO ARCHIVE
                    </Link>
                </div>

                <article className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                        {/* Sidebar Meta */}
                        <div className="lg:col-span-3 space-y-12">
                            <div className="space-y-4">
                                <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase">Author</p>
                                <p className="font-serif text-xl italic font-light">{article.author}</p>
                            </div>
                            <div className="space-y-4">
                                <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase">Date</p>
                                <p className="font-sans text-[11px] editorial-spacing">{article.date.toUpperCase()}</p>
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

                        {/* Main Content */}
                        <div className="lg:col-span-9 space-y-24">
                            <header className="space-y-12">
                                <div className="space-y-6">
                                    <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase tracking-[0.4em]">Journal Archive</p>
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
                                <p className="font-sans text-lg lg:text-xl text-foreground/80 leading-relaxed font-light first-letter:text-7xl first-letter:font-serif first-letter:mr-4 first-letter:float-left first-letter:text-foreground whitespace-pre-line">
                                    {article.content}
                                </p>
                            </div>

                            <footer className="pt-24 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <p className="font-sans text-[9px] editorial-spacing text-muted-foreground">CONTRIBUTOR</p>
                                        <p className="font-serif text-xl font-light">The Global Collective</p>
                                    </div>
                                    <Link to="/stories" className="font-sans text-[10px] editorial-spacing border border-foreground px-8 py-4 hover:bg-black hover:text-white transition-all">
                                        NEXT ARCHIVE ENTRY
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
