import { motion, AnimatePresence } from "framer-motion";
import { X, Search as SearchIcon, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { productService } from "@/services/productService";
import { Link } from "react-router-dom";

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const performSearch = async () => {
            setLoading(true);
            try {
                // Fetch all products for the search context (Big App optimized: fetching a reasonable slice)
                const { products: fetchedProducts } = await productService.getProducts({
                    sortBy: 'newest',
                    pageSize: 50 // Limit initial search context for performance
                });

                if (query.trim() === "") {
                    setResults(fetchedProducts.slice(0, 8));
                } else {
                    const filtered = fetchedProducts.filter((p: any) => {
                        const brandName = p.brands?.name?.toLowerCase() || "";
                        const productName = p.name.toLowerCase();
                        const searchTerm = query.toLowerCase();

                        return (
                            productName.includes(searchTerm) ||
                            brandName.includes(searchTerm)
                        );
                    });
                    setResults(filtered);
                }
            } catch (error) {
                console.error("Discovery Error:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            performSearch();
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Handle background scroll and escape key
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener("keydown", handleEsc);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-background overflow-y-auto"
                >
                    <div className="min-h-screen flex flex-col pt-32 pb-24 px-6 lg:px-12">
                        <button
                            onClick={onClose}
                            className="fixed top-12 right-6 lg:right-12 p-4 hover:scale-110 transition-transform z-[110]"
                        >
                            <X className="w-6 h-6 stroke-[1px]" />
                        </button>

                        <div className="max-w-[1440px] mx-auto w-full flex-1">
                            <div className="relative border-b border-border pb-8">
                                <input
                                    autoFocus
                                    id="site-search"
                                    name="q"
                                    type="text"
                                    placeholder="SEARCH THE ARCHIVE..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full bg-transparent font-serif text-4xl lg:text-7xl font-light outline-none placeholder:text-muted-foreground/30 uppercase tracking-tighter"
                                />
                                <SearchIcon className="absolute right-0 bottom-12 w-8 h-8 text-muted-foreground/30 stroke-[1px]" />
                            </div>

                            <div className="mt-24 grid grid-cols-1 lg:grid-cols-12 gap-16">
                                <div className="lg:col-span-3">
                                    <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-8 uppercase">Suggested Houses</p>
                                    <div className="grid grid-cols-1 gap-4">
                                        {["DAR RIME", "ATELIER ATLAS", "DAR AL AROUS", "KHALIL ATELIER"].map(house => (
                                            <button
                                                key={house}
                                                onClick={() => setQuery(house)}
                                                className="text-left font-serif text-xl italic font-light hover:text-muted-foreground transition-colors"
                                            >
                                                {house}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="lg:col-span-9">
                                    <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-12 uppercase">
                                        {query ? `Found in Archive (${results.length})` : "Featured Exhibits"}
                                    </p>

                                    {loading ? (
                                        <div className="py-24 flex items-center justify-center lg:col-span-9">
                                            <div className="w-8 h-8 border-2 border-foreground/10 border-t-foreground rounded-full animate-spin" />
                                        </div>
                                    ) : results.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                                            {results.map((product) => (
                                                <Link
                                                    key={product.id}
                                                    to={`/product/${product.slug}`}
                                                    onClick={onClose}
                                                    className="group block space-y-4"
                                                >
                                                    <div className="aspect-[3/4] overflow-hidden bg-secondary/20 border border-border/10">
                                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                    </div>
                                                    <div>
                                                        <p className="font-sans text-[8px] editorial-spacing text-muted-foreground mb-1">{product.brands?.name?.toUpperCase()}</p>
                                                        <h4 className="font-serif text-sm font-light flex items-center justify-between">
                                                            <span>{product.name}</span>
                                                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </h4>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-24 text-center border border-dashed border-border lg:col-span-9">
                                            <p className="font-serif text-2xl italic text-muted-foreground/40">No entries located in the collection.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchOverlay;
