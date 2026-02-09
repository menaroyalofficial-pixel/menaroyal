import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Package, MapPin, Settings, LogOut, ShoppingBag, Clock } from "lucide-react";
import { toast } from "sonner";

const Account = () => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'shipping' | 'settings'>('orders');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/login");
                return;
            }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            setProfile(profileData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success("Signed out of the Archive.");
        navigate("/");
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'orders':
                return (
                    <div className="py-40 text-center border border-dashed border-border bg-secondary/5">
                        <Package className="w-8 h-8 mx-auto mb-6 text-muted-foreground/30 stroke-[1px]" />
                        <p className="font-serif text-xl italic text-muted-foreground mb-8">Your order archive is currently empty.</p>
                        <button
                            onClick={() => navigate("/shop")}
                            className="px-8 py-4 bg-black text-white font-sans text-[10px] editorial-spacing uppercase hover:bg-neutral-800 transition-all"
                        >
                            Discover the Collection
                        </button>
                    </div>
                );
            case 'wishlist':
                return (
                    <div className="py-40 text-center border border-dashed border-border">
                        <Clock className="w-8 h-8 mx-auto mb-6 text-muted-foreground/30 stroke-[1px]" />
                        <p className="font-serif text-xl italic text-muted-foreground">Your curated digital heritage is in progress.</p>
                    </div>
                );
            case 'shipping':
                return (
                    <div className="space-y-12">
                        <div className="p-12 border border-border bg-secondary/5">
                            <h3 className="font-serif text-2xl mb-4 italic tracking-tighter">Global Concierge</h3>
                            <p className="font-sans text-xs text-muted-foreground leading-relaxed max-w-md">Our institutional logistics team handles all cross-border documentation for your heritage acquisitions.</p>
                            <div className="mt-12 p-8 border border-dashed border-border text-center font-sans text-[10px] text-muted-foreground uppercase editorial-spacing">No addresses on file</div>
                        </div>
                    </div>
                );
            case 'settings':
                return (
                    <div className="max-w-md space-y-12">
                        <div className="space-y-4">
                            <label className="font-sans text-[10px] text-muted-foreground uppercase editorial-spacing">Member Identification</label>
                            <input disabled value={profile?.full_name || ""} className="w-full bg-secondary/10 border border-border p-4 font-sans text-xs editorial-spacing opacity-50" />
                            <input disabled value={profile?.email || ""} className="w-full bg-secondary/10 border border-border p-4 font-sans text-xs editorial-spacing opacity-50" />
                        </div>
                        <p className="font-sans text-[9px] text-muted-foreground italic leading-relaxed">To modify your institutional identity, please contact the archival concierge.</p>
                    </div>
                );
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
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-3 space-y-12">
                            <div>
                                <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-4 uppercase">Institutional Member</p>
                                <h1 className="font-serif text-4xl font-light tracking-tighter uppercase">{profile?.full_name || "MEMBER"}</h1>
                            </div>

                            <nav className="space-y-4">
                                {[
                                    { id: 'orders', label: "My Archive", icon: ShoppingBag },
                                    { id: 'wishlist', label: "Curated Wishlist", icon: Clock },
                                    { id: 'shipping', label: "Shipping Concierge", icon: MapPin },
                                    { id: 'settings', label: "Institutional Settings", icon: Settings },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id as any)}
                                        className={`flex items-center gap-4 w-full p-4 border border-border transition-all font-sans text-[10px] editorial-spacing uppercase ${activeTab === item.id ? 'bg-secondary/20 border-foreground' : 'hover:bg-secondary/10'}`}
                                    >
                                        <item.icon className="w-4 h-4 stroke-[1px]" />
                                        {item.label}
                                    </button>
                                ))}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-4 w-full p-4 border border-border hover:bg-red-50 hover:text-red-600 transition-all font-sans text-[10px] editorial-spacing uppercase text-muted-foreground hover:border-red-100"
                                >
                                    <LogOut className="w-4 h-4 stroke-[1px]" />
                                    Sign Out
                                </button>
                            </nav>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-9">
                            <div className="mb-12 border-b border-border pb-6">
                                <h2 className="font-serif text-2xl italic capitalize">{activeTab.replace('_', ' ')}</h2>
                            </div>

                            {renderContent()}
                        </div>

                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Account;
