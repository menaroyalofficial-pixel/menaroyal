import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Camera, MapPin, Type, Globe, CheckCircle2 } from "lucide-react";

const Onboarding = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [brand, setBrand] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        story: "",
        country: "",
        category: "",
        cover_image: "",
        logo: "",
    });

    useEffect(() => {
        fetchBrand();
    }, [slug]);

    const fetchBrand = async () => {
        try {
            const { data, error } = await supabase
                .from('brands')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error || !data) {
                toast.error("Archive not located.");
                navigate("/");
                return;
            }

            setBrand(data);
            setFormData({
                name: data.name || "",
                description: data.description || "",
                story: data.story || "",
                country: data.country || "",
                category: data.category || "",
                cover_image: data.cover_image || "",
                logo: data.logo || "",
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase
                .from('brands')
                .update({
                    ...formData,
                    status: 'active' // Once they save their profile, they go active
                })
                .eq('slug', slug);

            if (error) throw error;

            toast.success("Heritage Profile Curated.");
            // Redirect to their newly created page
            navigate(`/brand/${slug}`);
        } catch (error: any) {
            toast.error(error.message || "Archive update failed.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-foreground/10 border-t-foreground rounded-full animate-spin" />
        </div>
    );

    return (
        <Layout>
            <div className="bg-background min-h-screen">
                <div className="pt-32 pb-24 border-b border-border">
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
                        <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-6 uppercase tracking-[0.3em]">
                            Heritage Onboarding
                        </p>
                        <h1 className="font-serif text-5xl lg:text-8xl font-light text-foreground tracking-tighter">
                            The <span className="italic">Atelier Setup</span>
                        </h1>
                        <p className="font-sans text-xs text-muted-foreground mt-8 max-w-xl mx-auto leading-relaxed editorial-spacing font-light uppercase opacity-60">
                            Welcome, {brand?.name}. Please define your house's presence in our global archive.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="max-w-[1440px] mx-auto px-6 lg:px-12 py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
                        {/* Visual Assets */}
                        <div className="lg:col-span-5 space-y-12">
                            <div className="space-y-6">
                                <label className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase flex items-center gap-2">
                                    <Camera className="w-3 h-3" /> Cover Archive (URL)
                                </label>
                                <div className="aspect-[16/10] bg-secondary/20 relative group overflow-hidden border border-border">
                                    {formData.cover_image ? (
                                        <img src={formData.cover_image} className="w-full h-full object-cover" alt="Cover preview" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 italic text-sm">
                                            Cinematic Cover Image
                                        </div>
                                    )}
                                    <input
                                        type="url"
                                        className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 font-sans text-[10px] outline-none border-t border-border"
                                        placeholder="PASTE IMAGE URL..."
                                        value={formData.cover_image}
                                        onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase flex items-center gap-2">
                                    <Globe className="w-3 h-3" /> Origin & Category
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="COUNTRY"
                                        className="bg-transparent border-b border-border py-3 font-sans text-xs uppercase outline-none focus:border-foreground transition-all"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        required
                                    />
                                    <select
                                        className="bg-transparent border-b border-border py-3 font-sans text-xs uppercase outline-none focus:border-foreground transition-all"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    >
                                        <option value="">CATEGORY</option>
                                        <option value="Bridal">Bridal</option>
                                        <option value="Fashion">Fashion</option>
                                        <option value="Maison">Maison</option>
                                        <option value="Jewelry">Jewelry</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Narrative Content */}
                        <div className="lg:col-span-7 space-y-24">
                            <div className="space-y-12 p-12 bg-secondary/10 border border-border relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <CheckCircle2 className="w-24 h-24 stroke-[1px]" />
                                </div>
                                <div>
                                    <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase mb-2">Financial Registry</p>
                                    <h3 className="font-serif text-2xl italic mb-6">Connect Payouts via Stripe</h3>
                                    <p className="font-sans text-xs text-muted-foreground leading-relaxed mb-8 max-w-md">
                                        To receive automated settlements for your sales, you must link your atelier's bank account via Stripe Connect.
                                        <br /><br />
                                        <span className="text-foreground italic">Curation Fee: 10% | Payout Rate: 90%</span>
                                    </p>

                                    {brand?.stripe_connect_id ? (
                                        <div className="flex items-center gap-3 text-green-600 font-sans text-[10px] editorial-spacing uppercase bg-green-50 px-6 py-4 border border-green-100 w-full lg:w-fit">
                                            <CheckCircle2 className="w-4 h-4" /> Account Verified & Linked
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className="px-8 py-4 bg-[#635BFF] text-white font-sans text-[10px] editorial-spacing uppercase hover:bg-[#5249e0] transition-all flex items-center gap-3"
                                            onClick={() => toast.info("Redirecting to Stripe Express...")}
                                        >
                                            Establish Financial Linkage
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase flex items-center gap-2">
                                    <Type className="w-3 h-3" /> The Short Narrative
                                </label>
                                <input
                                    type="text"
                                    placeholder="A brief sentence describing your house..."
                                    className="w-full bg-transparent border-b border-border py-4 font-serif text-2xl italic font-light outline-none focus:border-foreground transition-all"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-6">
                                <label className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase flex items-center gap-2">
                                    <Type className="w-3 h-3" /> The Heritage Story
                                </label>
                                <textarea
                                    placeholder="Tell the story of your atelier, your craft, and your vision..."
                                    rows={10}
                                    className="w-full bg-secondary/5 border border-border p-8 font-sans text-sm font-light leading-relaxed outline-none focus:border-foreground transition-all resize-none"
                                    value={formData.story}
                                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="pt-12">
                                <button
                                    disabled={saving}
                                    className="w-full lg:w-auto px-24 py-5 bg-black text-white font-sans text-[10px] editorial-spacing uppercase hover:bg-neutral-800 transition-all disabled:opacity-50"
                                >
                                    {saving ? "Archiving Heritage..." : "Finalize House Profile"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default Onboarding;
