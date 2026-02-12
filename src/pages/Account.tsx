import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/layout/Layout";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package, MapPin, Settings, LogOut, ShoppingBag,
    Clock, Heart, CreditCard, ChevronRight, User, Truck
} from "lucide-react";
import { toast } from "sonner";
import { orderService } from "@/services/orderService";
import { formatPrice } from "@/data/mockData";

const Account = () => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'concierge' | 'vault'>('orders');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { navigate("/login"); return; }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            setProfile(profileData);
            const ordersData = await orderService.getCustomerOrders(session.user.id);
            setOrders(ordersData || []);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success("Signed out of the Archive.");
        navigate("/");
    };

    const renderOrders = () => (
        <div className="space-y-12">
            {orders.length === 0 ? (
                <div className="py-40 text-center border border-dashed border-border bg-white italic text-muted-foreground font-serif">
                    Your acquisition archive is currently empty.
                </div>
            ) : (
                orders.map((order) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={order.id}
                        className="bg-white border border-border p-8 lg:p-12 group hover:border-black transition-all"
                    >
                        <div className="flex flex-col lg:flex-row justify-between gap-12">
                            <div className="space-y-6 flex-1">
                                <div className="flex items-center gap-4">
                                    <p className="font-sans text-[10px] uppercase font-bold tracking-widest bg-neutral-100 px-3 py-1">#{order.id.slice(0, 8)}</p>
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    <p className="font-sans text-[10px] uppercase text-green-600">{order.status}</p>
                                </div>
                                <h3 className="font-serif text-3xl font-light">Archival Deposit</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-6 border-t border-border">
                                    <div>
                                        <p className="font-sans text-[8px] text-muted-foreground uppercase mb-1">Acquired On</p>
                                        <p className="font-sans text-[10px]">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="font-sans text-[8px] text-muted-foreground uppercase mb-1">Total Valuation</p>
                                        <p className="font-sans text-[10px] font-bold">{formatPrice(order.total_amount)}</p>
                                    </div>
                                    <div>
                                        <p className="font-sans text-[8px] text-muted-foreground uppercase mb-1">Logistics</p>
                                        <p className="font-sans text-[10px] flex items-center gap-1"><Truck className="w-3 h-3" /> Standard</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex -space-x-4">
                                {order.order_items.map((item: any, i: number) => (
                                    <div key={item.id} className="w-24 aspect-[3/4] bg-neutral-100 border border-border overflow-hidden relative" style={{ zIndex: 10 - i }}>
                                        <img src={item.products?.images?.[0]} className="w-full h-full object-cover grayscale" alt="" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    );

    return (
        <Layout>
            <div className="bg-[#fcfcfc] min-h-screen pt-40 pb-24 px-6 lg:px-12">
                <div className="max-w-[1440px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                        {/* Membership Sidebar */}
                        <div className="lg:col-span-3 space-y-12">
                            <div className="space-y-4">
                                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center border border-border">
                                    <User className="w-8 h-8 text-muted-foreground/30 stroke-[1px]" />
                                </div>
                                <div>
                                    <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase mb-2">Member Tier: Patron</p>
                                    <h1 className="font-serif text-4xl tracking-tighter uppercase">{profile?.full_name || "Member"}</h1>
                                </div>
                            </div>

                            <nav className="space-y-3">
                                {[
                                    { id: 'orders', label: "My Archive", icon: ShoppingBag },
                                    { id: 'wishlist', label: "Curated Wishlist", icon: Heart },
                                    { id: 'concierge', label: "Logistics Concierge", icon: MapPin },
                                    { id: 'vault', label: "Member Vault", icon: CreditCard },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`w-full flex items-center justify-between p-5 border transition-all font-sans text-[10px] uppercase tracking-widest ${activeTab === tab.id ? 'bg-black text-white border-black' : 'bg-white border-border hover:border-black'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <tab.icon className="w-4 h-4 stroke-[1px]" />
                                            {tab.label}
                                        </div>
                                        <ChevronRight className={`w-3 h-3 opacity-30 ${activeTab === tab.id ? 'text-white' : ''}`} />
                                    </button>
                                ))}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 p-5 text-red-500 font-sans text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all border border-transparent"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Dissolve Session
                                </button>
                            </nav>
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-9">
                            <div className="mb-12 flex items-center justify-between border-b border-border pb-8">
                                <h2 className="font-serif text-4xl font-light italic capitalize tracking-tighter">
                                    {activeTab === 'orders' ? 'Acquisition Archive' : activeTab.replace('_', ' ')}
                                </h2>
                                <p className="font-sans text-[8px] uppercase text-muted-foreground editorial-spacing">Institutional Security Active</p>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                    {activeTab === 'orders' && renderOrders()}
                                    {activeTab === 'wishlist' && (
                                        <div className="py-40 text-center border border-dashed border-border bg-white italic text-muted-foreground font-serif">Your curated digital heritage is in progress.</div>
                                    )}
                                    {activeTab === 'concierge' && (
                                        <div className="space-y-8">
                                            <div className="p-12 border border-border bg-white group hover:border-black transition-all">
                                                <h3 className="font-serif text-2xl mb-6 italic">Global Destination</h3>
                                                <div className="p-12 border border-dashed border-border text-center font-sans text-[9px] uppercase tracking-widest text-muted-foreground">No destinations currently archived</div>
                                                <button className="mt-8 px-10 py-4 bg-black text-white font-sans text-[9px] uppercase hover:bg-neutral-800 transition-all">Register New Address</button>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'vault' && (
                                        <div className="max-w-md p-12 border border-border bg-white">
                                            <h3 className="font-serif text-2xl mb-8 italic">Financial Identity</h3>
                                            <div className="space-y-6">
                                                <input disabled value={profile?.email || ""} className="w-full bg-neutral-50 border border-border p-4 font-sans text-[10px] uppercase opacity-50" />
                                                <div className="p-6 border border-dashed border-border text-center font-sans text-[9px] uppercase text-muted-foreground">No payment instruments archived</div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Account;
