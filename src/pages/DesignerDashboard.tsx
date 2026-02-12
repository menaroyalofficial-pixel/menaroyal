import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { productService } from "@/services/productService";
import { orderService } from "@/services/orderService";
import { emailService } from "@/services/emailService";
import Layout from "@/components/layout/Layout";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Package, TrendingUp, Eye, Trash2, Image as ImageIcon,
    LogOut, PlusCircle, ShoppingBag, BarChart3, Truck, ArrowUpRight,
    Search, Download, Check
} from "lucide-react";
import { toast } from "sonner";

const DesignerDashboard = () => {
    const [activeTab, setActiveTab] = useState<'insights' | 'inventory' | 'orders'>('insights');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [trackingNumber, setTrackingNumber] = useState("");
    const navigate = useNavigate();

    const [newProduct, setNewProduct] = useState({
        name: "", description: "", price: "", images: "", category_id: "Fashion", stock: "1",
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { navigate("/designer/login"); return; }

            const { data: userProfile } = await supabase
                .from('profiles')
                .select('*, brands(*)')
                .eq('id', session.user.id)
                .single();

            if (!userProfile?.brand_id) { navigate("/"); return; }
            setProfile(userProfile);

            const [brandStats, brandProducts, brandOrders] = await Promise.all([
                productService.getBrandStats(userProfile.brand_id),
                productService.getBrandProducts(userProfile.brand_id),
                orderService.getBrandOrders(userProfile.brand_id)
            ]);

            setStats(brandStats);
            setProducts(brandProducts);
            setOrders(brandOrders);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleUpdateShipping = async (itemId: string, customerEmail: string) => {
        if (!trackingNumber) { toast.error("Please enter a tracking reference."); return; }
        try {
            await orderService.updateItemStatus(itemId, 'shipped', trackingNumber);
            await emailService.sendShippingUpdate(customerEmail, itemId, trackingNumber);
            toast.success("Dispatch confirmed. Patron notified.");
            setTrackingNumber("");
            fetchInitialData();
        } catch (error) { toast.error("Logistics update failed."); }
    };

    const renderInsights = () => (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Archived Pieces", value: products.length, icon: Package, trend: "+2 this season" },
                    { label: "Global Impressions", value: stats?.profileViews || 0, icon: Eye, trend: "Trending" },
                    { label: "Heritage Revenue", value: `$${stats?.totalSales || 0}`, icon: TrendingUp, trend: "Payout pending" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-10 bg-white border border-border hover:border-black transition-all group"
                    >
                        <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase mb-6 flex items-center gap-2">
                            <stat.icon className="w-3 h-3" /> {stat.label}
                        </p>
                        <p className="font-serif text-5xl font-light mb-4 tracking-tighter">{stat.value}</p>
                        <p className="font-sans text-[9px] text-muted-foreground uppercase flex items-center gap-2 italic">
                            <ArrowUpRight className="w-2 h-2" /> {stat.trend}
                        </p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-10 border border-border bg-white space-y-6">
                    <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase flex items-center gap-2">
                        <Plus className="w-3 h-3 rotate-45" /> Financial Registry
                    </p>
                    <h3 className="font-serif text-2xl italic tracking-tighter">Settlement Status</h3>
                    <div className="flex items-center justify-between p-6 bg-secondary/5 border border-border">
                        <div>
                            <p className="font-sans text-[10px] uppercase font-bold">Stripe Connect</p>
                            <p className="font-sans text-[8px] text-muted-foreground uppercase mt-1">
                                {profile?.brands?.stripe_connect_id ? 'Institutional Link Active' : 'Action Required: Pending Linkage'}
                            </p>
                        </div>
                        {profile?.brands?.stripe_connect_id ? (
                            <Check className="w-4 h-4 text-green-600" />
                        ) : (
                            <button className="px-4 py-2 bg-black text-white font-sans text-[8px] uppercase">Link Account</button>
                        )}
                    </div>
                </div>

                <div className="p-10 border border-border bg-white flex flex-col justify-center italic text-muted-foreground/30 font-serif text-center">
                    Regional Market Trends & Forecasts
                </div>
            </div>
        </div>
    );

    const renderOrders = () => (
        <div className="space-y-8">
            <div className="flex justify-between items-center mb-12 border-b border-border pb-8">
                <h2 className="font-serif text-3xl font-light">Patronage <span className="italic">Ledger</span></h2>
                <button className="flex items-center gap-2 font-sans text-[9px] uppercase border border-border px-4 py-2 hover:bg-neutral-50">
                    <Download className="w-3 h-3" /> Export CSV
                </button>
            </div>

            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white border border-border p-8 lg:p-12 hover:border-black transition-all">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            <div className="lg:col-span-2">
                                <div className="aspect-[3/4] bg-neutral-100 overflow-hidden border border-border">
                                    <img src={order.products?.images?.[0]} alt="" className="w-full h-full object-cover grayscale" />
                                </div>
                            </div>
                            <div className="lg:col-span-4 space-y-2">
                                <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase">Order #{order.id.slice(0, 8)}</p>
                                <h3 className="font-serif text-2xl font-light">{order.products?.name}</h3>
                                <p className="font-sans text-xs text-muted-foreground">{order.orders?.customer_email}</p>
                            </div>
                            <div className="lg:col-span-3 text-right">
                                <p className="font-serif text-xl">${order.price_at_purchase}</p>
                                <p className={`font-sans text-[9px] uppercase mt-2 ${order.shipping_status === 'shipped' ? 'text-green-600' : 'text-amber-600'}`}>
                                    {order.shipping_status}
                                </p>
                            </div>
                            <div className="lg:col-span-3">
                                {order.shipping_status === 'pending' ? (
                                    <div className="space-y-4">
                                        <input
                                            placeholder="TRACKING #"
                                            className="w-full bg-secondary/10 border border-border py-2 px-4 font-sans text-[10px] outline-none"
                                            value={trackingNumber}
                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                        />
                                        <button
                                            onClick={() => handleUpdateShipping(order.id, order.orders.customer_email)}
                                            className="w-full bg-black text-white py-3 font-sans text-[9px] uppercase hover:bg-neutral-800 transition-all"
                                        >
                                            Confirm Dispatch
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-end gap-2 text-green-600 font-sans text-[9px] uppercase">
                                        <Check className="w-3 h-3" /> {order.tracking_number}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="bg-[#fcfcfc] min-h-screen pt-40 pb-24 px-6 lg:px-12">
                <div className="max-w-[1440px] mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-foreground/20"></span>
                                <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase tracking-[0.3em]">Atelier Registry</p>
                            </div>
                            <h1 className="font-serif text-6xl lg:text-8xl font-light tracking-tighter">
                                {profile?.brands?.name} <span className="italic opacity-30">Console</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-4 bg-white border border-border p-2">
                            {[
                                { id: 'insights', icon: BarChart3, label: 'Insights' },
                                { id: 'inventory', icon: Package, label: 'Inventory' },
                                { id: 'orders', icon: Truck, label: 'Orders' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-8 py-4 font-sans text-[9px] uppercase transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-black text-white' : 'hover:bg-secondary/10'}`}
                                >
                                    <tab.icon className="w-3 h-3" /> {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-64 text-center">
                            <div className="w-8 h-8 border-2 border-foreground/10 border-t-foreground rounded-full animate-spin mx-auto" />
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {activeTab === 'insights' && renderInsights()}
                                {activeTab === 'orders' && renderOrders()}
                                {activeTab === 'inventory' && (
                                    <div className="space-y-12">
                                        <div className="flex justify-between items-center mb-16 border-b border-border pb-8">
                                            <h2 className="font-serif text-3xl font-light tracking-tighter">Archived <span className="italic underline underline-offset-8">Exhibits</span></h2>
                                            <button
                                                onClick={() => setShowAddForm(true)}
                                                className="px-10 py-5 bg-black text-white font-sans text-[10px] uppercase hover:bg-neutral-800 transition-all"
                                            >
                                                Archive New Selection
                                            </button>
                                        </div>
                                        {/* Products grid logic here or reused */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                                            {products.map((product) => (
                                                <div key={product.id} className="group">
                                                    <div className="aspect-[3/4] bg-[#f5f5f5] overflow-hidden border border-border mb-6 group-hover:border-black transition-all">
                                                        <img src={product.images?.[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                                                    </div>
                                                    <h3 className="font-serif text-xl uppercase tracking-tighter">{product.name}</h3>
                                                    <p className="font-sans text-[10px] text-muted-foreground uppercase mt-2">${product.price}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
            {/* Modal remains same for inventory addition */}
        </Layout>
    );
};

export default DesignerDashboard;
