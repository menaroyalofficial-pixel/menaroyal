import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { brandService } from "@/services/brandService";
import { emailService } from "@/services/emailService";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock, ExternalLink, Mail, Building2, LogOut, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const data = await brandService.getApplications();
            setApplications(data || []);
        } catch (error) {
            toast.error("Failed to access archives.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected', appData: any) => {
        try {
            await brandService.updateApplicationStatus(id, newStatus);

            let onboardingSlug = appData.company_name.toLowerCase().replace(/\s+/g, '-');
            let emailSent = false;

            // If approved, create the brand record (Big App flow)
            if (newStatus === 'approved') {
                const newBrand = await brandService.createBrandFromApplication(appData.company_name, appData.email);
                onboardingSlug = newBrand.slug;

                // Trigger Email Notification with the dynamic link
                emailSent = await emailService.sendApprovalEmail(appData.email, appData.company_name, onboardingSlug);
            } else {
                emailSent = await emailService.sendRejectionEmail(appData.email, appData.company_name);
            }

            if (emailSent) {
                toast.success(`Atelier ${newStatus === 'approved' ? 'Archived' : 'Declined'}. Notification sent.`);
            } else {
                toast.warning(`Status updated, but Email Archival failed. Check Edge Function logs.`);
            }

            fetchApplications();
        } catch (error: any) {
            console.error(error);
            toast.error(`Process failed: ${error.message}`);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    return (
        <Layout>
            <div className="bg-background min-h-screen pt-32 pb-24 px-6 lg:px-12">
                <div className="max-w-[1440px] mx-auto">
                    <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-4 uppercase">Institutional Access</p>
                            <h1 className="font-serif text-5xl lg:text-7xl font-light text-foreground tracking-tighter">
                                Admin <span className="italic">Vault</span>
                            </h1>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={fetchApplications}
                                className="p-4 border border-border hover:bg-secondary/20 transition-all group"
                                title="Refresh Archives"
                            >
                                <RefreshCcw className={`w-4 h-4 text-muted-foreground group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-6 py-4 border border-border hover:bg-red-50 hover:text-red-600 transition-all font-sans text-[10px] editorial-spacing uppercase"
                            >
                                <LogOut className="w-4 h-4" />
                                Exit Vault
                            </button>
                            <div className="px-6 py-4 border border-border bg-secondary/20 min-w-[140px]">
                                <p className="font-sans text-[8px] editorial-spacing text-muted-foreground uppercase mb-1">Total Intakes</p>
                                <p className="font-serif text-2xl">{applications.length}</p>
                            </div>
                            <div className="px-6 py-4 border border-border bg-secondary/20 min-w-[140px]">
                                <p className="font-sans text-[8px] editorial-spacing text-muted-foreground uppercase mb-1">Pending Review</p>
                                <p className="font-serif text-2xl">{applications.filter(a => a.status === 'received').length}</p>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-40 text-center">
                            <div className="w-8 h-8 border-2 border-foreground/10 border-t-foreground rounded-full animate-spin mx-auto mb-4" />
                            <p className="font-serif italic text-muted-foreground">Opening Archives...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8">
                            <AnimatePresence>
                                {applications.map((app) => (
                                    <motion.div
                                        key={app.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group bg-secondary/10 border border-border p-8 lg:p-12 hover:border-foreground/20 transition-all duration-500"
                                    >
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                                            <div className="lg:col-span-4 space-y-6">
                                                <div className="flex items-center gap-4 text-muted-foreground">
                                                    <Building2 className="w-4 h-4 stroke-[1px]" />
                                                    <p className="font-sans text-[10px] editorial-spacing uppercase">{app.company_name}</p>
                                                </div>
                                                <h2 className="font-serif text-3xl font-light">{app.contact_name}</h2>
                                                <div className="flex items-center gap-4 text-muted-foreground group-hover:text-foreground transition-colors overflow-hidden">
                                                    <Mail className="w-4 h-4 stroke-[1px]" />
                                                    <span className="font-sans text-xs truncate">{app.email}</span>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-5 space-y-8">
                                                <div>
                                                    <p className="font-sans text-[9px] editorial-spacing text-muted-foreground uppercase mb-3">Narrative & Portfolio</p>
                                                    <p className="font-sans text-sm text-foreground/70 leading-relaxed font-light italic mb-6">
                                                        "{app.message || "No message included."}"
                                                    </p>
                                                    <div className="flex flex-wrap gap-4">
                                                        {app.website && (
                                                            <a href={app.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-sans text-[10px] editorial-spacing border-b border-border pb-1 hover:border-foreground transition-all">
                                                                WEBSITE <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                        {app.portfolio_url && (
                                                            <a href={app.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-sans text-[10px] editorial-spacing border-b border-border pb-1 hover:border-foreground transition-all">
                                                                PORTFOLIO <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-3 flex flex-col items-end gap-6 h-full justify-between">
                                                <div className={`px-4 py-1.5 rounded-full border text-[9px] font-sans editorial-spacing uppercase ${app.status === 'approved' ? 'bg-green-500/10 text-green-600 border-green-200' :
                                                    app.status === 'rejected' ? 'bg-red-500/10 text-red-600 border-red-200' :
                                                        'bg-amber-500/10 text-amber-600 border-amber-200'
                                                    }`}>
                                                    {app.status}
                                                </div>

                                                {app.status === 'received' && (
                                                    <div className="flex gap-4 w-full">
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, 'rejected', app)}
                                                            className="flex-1 py-4 border border-border font-sans text-[9px] editorial-spacing hover:bg-red-50 hover:text-red-600 transition-all uppercase"
                                                        >
                                                            Decline
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, 'approved', app)}
                                                            className="flex-1 py-4 bg-black text-white font-sans text-[9px] editorial-spacing hover:bg-neutral-800 transition-all uppercase"
                                                        >
                                                            Archive House
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {applications.length === 0 && (
                                <div className="py-40 text-center border border-dashed border-border">
                                    <p className="font-serif text-2xl italic text-muted-foreground/30">The archive is currently empty.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
