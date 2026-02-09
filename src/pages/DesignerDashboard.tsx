import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { productService } from "@/services/productService";
import Layout from "@/components/layout/Layout";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Package,
    TrendingUp,
    Eye,
    Trash2,
    Image as ImageIcon,
    DollarSign,
    Tag
} from "lucide-react";
import { toast } from "sonner";

const DesignerDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const navigate = useNavigate();

    // New Product State
    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        price: "",
        images: "",
        category_id: "Fashion",
        stock: "1",
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/login");
                return;
            }

            // 1. Get User Profile & Brand ID
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('*, brands(*)')
                .eq('id', session.user.id)
                .single();

            if (!userProfile?.brand_id) {
                if (userProfile?.role === 'super_admin') {
                    toast.info("Institutional Leader detected. Redirecting to Vault.");
                    navigate("/admin");
                    return;
                }
                toast.error("Atelier access not found.");
                navigate("/");
                return;
            }

            setProfile(userProfile);

            // 2. Fetch Stats & Products
            const [brandStats, brandProducts] = await Promise.all([
                productService.getBrandStats(userProfile.brand_id),
                productService.getBrandProducts(userProfile.brand_id)
            ]);

            setStats(brandStats);
            setProducts(brandProducts);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await productService.addProduct({
                brand_id: profile.brand_id,
                name: newProduct.name,
                description: newProduct.description,
                price: parseFloat(newProduct.price),
                images: [newProduct.images],
                category_id: newProduct.category_id,
                stock: parseInt(newProduct.stock),
            });

            toast.success("Piece archived successfully.");
            setShowAddForm(false);
            fetchInitialData();
            setNewProduct({ name: "", description: "", price: "", images: "", category_id: "Fashion", stock: "1" });
        } catch (error) {
            toast.error("Failed to archive piece.");
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to remove this piece from the archive?")) return;
        try {
            await productService.deleteProduct(id);
            toast.success("Piece removed.");
            fetchInitialData();
        } catch (error) {
            toast.error("Removal failed.");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-foreground/10 border-t-foreground rounded-full animate-spin" />
        </div>
    );

    return (
        <Layout>
            <div className="bg-background min-h-screen pt-32 pb-24 px-6 lg:px-12">
                <div className="max-w-[1440px] mx-auto">
                    {/* Header */}
                    <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-4 uppercase">Atelier Archive</p>
                            <h1 className="font-serif text-5xl lg:text-7xl font-light text-foreground tracking-tighter">
                                {profile?.brands?.name} <span className="italic">Dashboard</span>
                            </h1>
                        </div>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-3 px-8 py-5 bg-black text-white font-sans text-[10px] editorial-spacing uppercase hover:bg-neutral-800 transition-all"
                        >
                            <Plus className="w-4 h-4" /> Archive New Piece
                        </button>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                        {[
                            { label: "Active Pieces", value: stats.totalProducts, icon: Package },
                            { label: "Heritage Views", value: stats.profileViews, icon: Eye },
                            { label: "Settled Revenue", value: `$${stats.totalSales}`, icon: TrendingUp },
                        ].map((stat, i) => (
                            <div key={i} className="p-8 border border-border bg-secondary/10 hover:border-foreground/20 transition-all duration-500">
                                <stat.icon className="w-5 h-5 text-muted-foreground mb-6 stroke-[1px]" />
                                <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase mb-2">{stat.label}</p>
                                <p className="font-serif text-4xl font-light">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Product Grid */}
                    <h2 className="font-serif text-2xl mb-12 italic border-b border-border pb-6 tracking-tighter">The Collection</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <AnimatePresence>
                            {products.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="group"
                                >
                                    <div className="aspect-[3/4] bg-secondary/20 relative overflow-hidden mb-6 border border-border">
                                        <img src={product.images?.[0]} className="w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700" alt="" />
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="p-3 bg-white/90 backdrop-blur-md border border-border hover:bg-red-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 duration-300"
                                            >
                                                <Trash2 className="w-4 h-4 stroke-[1px]" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase">{product.category_id}</p>
                                        <h3 className="font-serif text-lg leading-tight uppercase tracking-tighter">{product.name}</h3>
                                        <p className="font-serif text-base italic text-muted-foreground">${product.price}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {products.length === 0 && !showAddForm && (
                        <div className="py-40 text-center border border-dashed border-border opacity-30">
                            <p className="font-serif text-2xl italic">No pieces currently archived.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Product Modal */}
            <AnimatePresence>
                {showAddForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddForm(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 40, scale: 0.95 }}
                            className="bg-background border border-border w-full max-w-2xl relative z-10 p-12 lg:p-20 overflow-y-auto max-h-[90vh]"
                        >
                            <div className="mb-12">
                                <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-4 uppercase">Archive Intake</p>
                                <h2 className="font-serif text-4xl font-light tracking-tighter">New <span className="italic">Piece</span></h2>
                            </div>

                            <form onSubmit={handleAddProduct} className="space-y-10">
                                <div className="space-y-6">
                                    <div className="relative">
                                        <Tag className="absolute left-0 top-4 w-4 h-4 text-muted-foreground stroke-[1px]" />
                                        <input
                                            type="text"
                                            placeholder="PIECE NAME"
                                            className="w-full bg-transparent border-b border-border py-4 pl-8 font-sans text-xs editorial-spacing outline-none focus:border-foreground transition-all"
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="relative">
                                            <DollarSign className="absolute left-0 top-4 w-4 h-4 text-muted-foreground stroke-[1px]" />
                                            <input
                                                type="number"
                                                placeholder="PRICE"
                                                className="w-full bg-transparent border-b border-border py-4 pl-8 font-sans text-xs editorial-spacing outline-none focus:border-foreground transition-all"
                                                value={newProduct.price}
                                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="relative">
                                            <Package className="absolute left-0 top-4 w-4 h-4 text-muted-foreground stroke-[1px]" />
                                            <input
                                                type="number"
                                                placeholder="STOCK"
                                                className="w-full bg-transparent border-b border-border py-4 pl-8 font-sans text-xs editorial-spacing outline-none focus:border-foreground transition-all"
                                                value={newProduct.stock}
                                                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <ImageIcon className="absolute left-0 top-4 w-4 h-4 text-muted-foreground stroke-[1px]" />
                                        <input
                                            type="url"
                                            placeholder="IMAGE URL"
                                            className="w-full bg-transparent border-b border-border py-4 pl-8 font-sans text-xs editorial-spacing outline-none focus:border-foreground transition-all"
                                            value={newProduct.images}
                                            onChange={(e) => setNewProduct({ ...newProduct, images: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <textarea
                                        placeholder="DESCRIBE THE CRAFTSMANSHIP..."
                                        rows={4}
                                        className="w-full bg-secondary/5 border border-border p-6 font-sans text-xs font-light leading-relaxed outline-none focus:border-foreground transition-all resize-none"
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="flex-1 py-5 border border-border font-sans text-[10px] editorial-spacing uppercase hover:bg-secondary/20 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-5 bg-black text-white font-sans text-[10px] editorial-spacing uppercase hover:bg-neutral-800 transition-all"
                                    >
                                        Finalize Archive
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Layout>
    );
};

export default DesignerDashboard;
