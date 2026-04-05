import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { brandService } from "@/services/brandService";
import { emailService } from "@/services/emailService";
import { orderService } from "@/services/orderService";
import { productService } from "@/services/productService";
import { storyService, Story } from "@/services/storyService";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle, XCircle, Clock, ExternalLink, Mail, Building2,
    LogOut, RefreshCcw, LayoutDashboard, ShoppingBag, Users,
    Package, BarChart3, Settings, TrendingUp, DollarSign, ArrowUpRight,
    BookOpen, Plus, Trash2
} from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'brands' | 'products' | 'analytics' | 'journal'>('overview');
    const [applications, setApplications] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [stories, setStories] = useState<Story[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showStoryForm, setShowStoryForm] = useState(false);
    const navigate = useNavigate();

    const [newStory, setNewStory] = useState({
        title: "", subtitle: "", excerpt: "", content: "", image: "", category: "Culture", read_time: "5 min read"
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [apps, latestOrders, journalStories] = await Promise.all([
                brandService.getApplications(),
                orderService.getAllOrders(),
                storyService.getAllStories()
            ]);
            setApplications(apps || []);
            setOrders(latestOrders || []);
            setStories(journalStories || []);
            setStats({
                revenue: 124500,
                growth: "+14%",
                activeBrands: apps?.filter(a => a.status === 'approved').length || 0,
                pendingOrders: latestOrders?.filter((o: any) => o.status === 'pending').length || 0
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to access archives.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await storyService.createStory(newStory);
            toast.success("Narrative archived in Journal.");
            setShowStoryForm(false);
            setNewStory({ title: "", subtitle: "", excerpt: "", content: "", image: "", category: "Culture", read_time: "5 min read" });
            fetchAllData();
        } catch (error) { toast.error("Archival failure."); }
    };

    const handleDeleteStory = async (id: string) => {
        if (!confirm("De-archive this narrative?")) return;
        try {
            await storyService.deleteStory(id);
            toast.success("Narrative dissolved.");
            fetchAllData();
        } catch (error) { toast.error("Destruction failed."); }
    };

    const handleApproveApplication = async (app: any) => {
        try {
            await brandService.updateApplicationStatus(app.id, 'approved');
            await brandService.createBrandFromApplication(app.company_name, app.email);
            await emailService.sendApprovalEmail(app.email, app.company_name, app.company_name.toLowerCase().replace(/\s+/g, '-'));
            toast.success("Application approved and onboarding email sent.");
            fetchAllData();
        } catch (error) { toast.error("Error approving application."); }
    };

    const handleDeclineApplication = async (app: any) => {
        if (!confirm(`Are you sure you want to decline ${app.company_name}?`)) return;
        try {
            await brandService.updateApplicationStatus(app.id, 'rejected');
            await emailService.sendRejectionEmail(app.email, app.company_name);
            toast.success("Application declined.");
            fetchAllData();
        } catch (error) { toast.error("Error declining application."); }
    };

    const renderOverview = () => (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Revenue", value: `$${stats?.revenue.toLocaleString()}`, icon: DollarSign, trend: stats?.growth },
                    { label: "Active Houses", value: stats?.activeBrands, icon: Building2, trend: "Institutional" },
                    { label: "Pending Intake", value: applications.filter(a => a.status === 'received').length, icon: Clock, trend: "Attention Required" },
                    { label: "Pending Dispatch", value: stats?.pendingOrders, icon: Package, trend: "Logistics" }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-8 bg-white border border-border hover:border-black transition-all group"
                    >
                        <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase flex items-center gap-2 mb-4">
                            <stat.icon className="w-3 h-3" /> {stat.label}
                        </p>
                        <p className="font-serif text-3xl font-light mb-2">{stat.value}</p>
                        <p className="font-sans text-[8px] text-green-600 uppercase flex items-center gap-1">
                            <ArrowUpRight className="w-2 h-2" /> {stat.trend}
                        </p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="p-8 border border-border bg-white rounded-sm">
                    <h3 className="font-serif text-xl mb-8 italic">Recent Acquisitions</h3>
                    <div className="space-y-6">
                        {orders.slice(0, 5).map((order) => (
                            <div key={order.id} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                                <div>
                                    <p className="font-sans text-[10px] font-bold">#{order.id.slice(0, 8)}</p>
                                    <p className="font-sans text-[8px] text-muted-foreground uppercase">{order.customer_email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-sans text-[10px]">${order.total_amount}</p>
                                    <p className={`font-sans text-[7px] uppercase ${order.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>{order.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-8 border border-border bg-white rounded-sm">
                    <h3 className="font-serif text-xl mb-8 italic">Brand Applications</h3>
                    <div className="space-y-6">
                        {applications.filter(a => a.status === 'received').slice(0, 5).map((app) => (
                            <div key={app.id} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                                <div>
                                    <p className="font-sans text-[10px] font-bold uppercase">{app.company_name}</p>
                                    <p className="font-sans text-[8px] text-muted-foreground uppercase">{app.contact_name}</p>
                                </div>
                                <button onClick={() => setActiveTab('brands')} className="font-sans text-[8px] border-b border-black pb-0.5 hover:opacity-50 transition-all uppercase">Review</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderJournal = () => (
        <div className="space-y-12">
            <div className="flex justify-between items-center mb-16 border-b border-border pb-8">
                <h2 className="font-serif text-3xl font-light">Journal <span className="italic">Archives</span></h2>
                <button
                    onClick={() => setShowStoryForm(true)}
                    className="flex items-center gap-2 px-8 py-4 bg-black text-white font-sans text-[9px] uppercase hover:bg-neutral-800 transition-all"
                >
                    <Plus className="w-3 h-3" /> Insert Narrative
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stories.map((story) => (
                    <div key={story.id} className="group bg-white border border-border p-8 hover:border-black transition-all">
                        <div className="aspect-[16/9] mb-6 overflow-hidden bg-secondary/20">
                            <img src={story.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                        </div>
                        <p className="font-sans text-[8px] text-muted-foreground uppercase editorial-spacing mb-2">{story.category}</p>
                        <h3 className="font-serif text-xl mb-4 leading-tight">{story.title}</h3>
                        <div className="flex justify-between items-center pt-6 border-t border-border">
                            <span className="font-sans text-[8px] text-muted-foreground uppercase">{story.read_time}</span>
                            <button onClick={() => handleDeleteStory(story.id)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showStoryForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white max-w-2xl w-full p-12 relative overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setShowStoryForm(false)} className="absolute top-8 right-8 text-black"><XCircle className="w-6 h-6 stroke-[1px]" /></button>
                        <h3 className="font-serif text-3xl mb-12 italic">New Journal Entry</h3>
                        <form onSubmit={handleCreateStory} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input placeholder="NARRATIVE TITLE" required className="w-full border-b border-border py-3 outline-none font-serif text-lg" value={newStory.title} onChange={e => setNewStory({ ...newStory, title: e.target.value })} />
                                <input placeholder="SUBTITLE" className="w-full border-b border-border py-3 outline-none font-sans text-[10px] uppercase" value={newStory.subtitle} onChange={e => setNewStory({ ...newStory, subtitle: e.target.value })} />
                                <input placeholder="IMAGE URL" required className="w-full border-b border-border py-3 outline-none font-sans text-[10px]" value={newStory.image} onChange={e => setNewStory({ ...newStory, image: e.target.value })} />
                                <select className="w-full border-b border-border py-3 outline-none font-sans text-[10px] uppercase" value={newStory.category} onChange={e => setNewStory({ ...newStory, category: e.target.value })}>
                                    <option>Culture</option><option>Craft</option><option>Interior</option><option>Art</option>
                                </select>
                            </div>
                            <textarea placeholder="EXCERPT (Summary)" required className="w-full border border-border p-4 outline-none font-sans text-[11px] h-24" value={newStory.excerpt} onChange={e => setNewStory({ ...newStory, excerpt: e.target.value })} />
                            <textarea placeholder="FULL NARRATIVE CONTENT" required className="w-full border border-border p-4 outline-none font-sans text-[11px] h-64" value={newStory.content} onChange={e => setNewStory({ ...newStory, content: e.target.value })} />
                            <button type="submit" className="w-full bg-black text-white py-5 font-sans text-[10px] uppercase hover:bg-neutral-800 transition-all">Archive narrative</button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );

    const renderBrands = () => (
        <div className="grid grid-cols-1 gap-8">
            {applications.map((app) => (
                <div key={app.id} className="group bg-white border border-border p-8 lg:p-12 hover:border-black transition-all">
                    <div className="flex flex-col lg:flex-row justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className={`w-1.5 h-1.5 rounded-full ${app.status === 'approved' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase">{app.company_name}</p>
                            </div>
                            <h2 className="font-serif text-3xl font-light">{app.contact_name}</h2>
                            <p className="font-sans text-xs text-muted-foreground italic max-w-lg">"{app.message}"</p>
                        </div>
                        <div className="flex flex-col items-end justify-between gap-6">
                            <p className="font-sans text-[10px] uppercase font-bold">{app.status}</p>
                            {app.status === 'received' && (
                                <div className="flex gap-4">
                                    <button onClick={() => handleDeclineApplication(app)} className="px-6 py-3 border border-border font-sans text-[9px] uppercase hover:bg-neutral-50">Decline</button>
                                    <button onClick={() => handleApproveApplication(app)} className="px-6 py-3 bg-black text-white font-sans text-[9px] uppercase hover:bg-neutral-800">Archive House</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <Layout>
            <div className="bg-[#fcfcfc] min-h-screen pt-40 pb-24 px-6 lg:px-12">
                <div className="max-w-[1440px] mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
                        <div>
                            <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-4 uppercase tracking-[0.3em]">Institutional Control</p>
                            <h1 className="font-serif text-6xl lg:text-8xl font-light tracking-tighter">
                                Admin <span className="italic">Vault</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-4 bg-white border border-border p-2">
                            {[
                                { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                                { id: 'orders', icon: ShoppingBag, label: 'Orders' },
                                { id: 'brands', icon: Users, label: 'Brands' },
                                { id: 'journal', icon: BookOpen, label: 'Journal' },
                                { id: 'products', icon: Package, label: 'Inquiry' },
                                { id: 'analytics', icon: BarChart3, label: 'Analytics' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-6 py-3 font-sans text-[9px] uppercase transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-black text-white' : 'hover:bg-secondary/10'}`}
                                >
                                    <tab.icon className="w-3 h-3" /> {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-64 text-center">
                            <RefreshCcw className="w-8 h-8 mx-auto animate-spin opacity-20" />
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {activeTab === 'overview' && renderOverview()}
                                {activeTab === 'brands' && renderBrands()}
                                {activeTab === 'journal' && renderJournal()}
                                {activeTab === 'orders' && (
                                    <div className="py-40 text-center border border-dashed border-border bg-white italic text-muted-foreground">Logistics module loading...</div>
                                )}
                                {activeTab === 'analytics' && (
                                    <div className="py-40 text-center border border-dashed border-border bg-white italic text-muted-foreground">Market intelligence loading...</div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
