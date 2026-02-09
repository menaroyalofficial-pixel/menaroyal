import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { brandService } from "@/services/brandService";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

const Apply = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        company_name: "",
        contact_name: "",
        email: "",
        website: "",
        portfolio_url: "",
        message: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await brandService.applyToCollective(formData);
            // 2. Notify the Admin
            const adminEmailBody = {
                to: "menaroyalofficial@gmail.com",
                subject: `New Collective Application: ${formData.company_name}`,
                html: `
                    <div style="font-family: serif; max-width: 600px; padding: 40px; border: 1px solid #eee;">
                        <h2 style="font-weight: 300;">New Intake Request</h2>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p><strong>Brand:</strong> ${formData.company_name}</p>
                        <p><strong>Contact:</strong> ${formData.contact_name}</p>
                        <p><strong>Portfolio:</strong> <a href="${formData.portfolio_url}">${formData.portfolio_url}</a></p>
                        <p><strong>Message:</strong> ${formData.message}</p>
                        <div style="margin-top: 30px;">
                            <a href="${window.location.origin}/admin" style="background: black; color: white; padding: 12px 24px; text-decoration: none; font-size: 10px; text-transform: uppercase;">Review in Vault</a>
                        </div>
                    </div>
                `
            };

            await supabase.functions.invoke('send-email', { body: adminEmailBody });

            toast.success("Identity Archival Request Received.");
            setFormData({
                company_name: "",
                contact_name: "",
                email: "",
                website: "",
                portfolio_url: "",
                message: ""
            });
        } catch (error: any) {
            console.error("Submission Error Details:", error.message || error);
            toast.error(`Archival Error: ${error.message || "Please check the console"}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <Layout>
            <div className="bg-background min-h-screen">
                {/* Header Section */}
                <div className="pt-40 pb-24 border-b border-border">
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
                        <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-8 uppercase tracking-[0.4em]">
                            The Collective Intake
                        </p>
                        <h1 className="font-serif text-5xl lg:text-9xl font-light text-foreground tracking-tighter leading-none mb-10">
                            Collective <span className="italic">Intake</span>
                        </h1>
                        <p className="font-sans text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed editorial-spacing font-light">
                            MENA ROYAL is an institutional archive for Middle Eastern excellence. We are currently inviting exceptional ateliers and heritage-driven designers to join our global network.
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
                        {/* Context Sidebar */}
                        <div className="lg:col-span-4 space-y-16">
                            <div className="space-y-6">
                                <h3 className="font-serif text-2xl italic font-light">The Selection Process</h3>
                                <p className="font-sans text-xs text-muted-foreground leading-relaxed editorial-spacing font-light">
                                    Our curatorial team reviews every application for heritage significance, artisanal quality, and institutional alignment. Successful applicants will be granted a dedicated House page and global distribution.
                                </p>
                            </div>
                            <div className="space-y-6">
                                <h3 className="font-serif text-2xl italic font-light">Global Distribution</h3>
                                <p className="font-sans text-xs text-muted-foreground leading-relaxed editorial-spacing font-light">
                                    Direct access to an international clientele seeking authentic Middle Eastern luxury, supported by our institutional marketing and logistics network.
                                </p>
                            </div>
                            <div className="pt-12 border-t border-border">
                                <p className="font-sans text-[9px] editorial-spacing text-muted-foreground mb-4">INQUIRIES</p>
                                <p className="font-serif text-xl font-light">archive@menaluxe.com</p>
                            </div>
                        </div>

                        {/* Application Form */}
                        <div className="lg:col-span-8">
                            <form onSubmit={handleSubmit} className="space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <label className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase">House / Company Name</label>
                                        <input
                                            required
                                            name="company_name"
                                            value={formData.company_name}
                                            onChange={handleChange}
                                            className="w-full bg-transparent border-b border-border py-3 outline-none focus:border-foreground transition-colors font-serif text-xl font-light"
                                            placeholder="e.g. DAR AL AROUS"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase">Contact Representative</label>
                                        <input
                                            required
                                            name="contact_name"
                                            value={formData.contact_name}
                                            onChange={handleChange}
                                            className="w-full bg-transparent border-b border-border py-3 outline-none focus:border-foreground transition-colors font-serif text-xl font-light"
                                            placeholder="FULL NAME"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <label className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-transparent border-b border-border py-3 outline-none focus:border-foreground transition-colors font-serif text-xl font-light"
                                            placeholder="CONTACT@HOUSE.COM"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase">Official Website</label>
                                        <input
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            className="w-full bg-transparent border-b border-border py-3 outline-none focus:border-foreground transition-colors font-serif text-xl font-light"
                                            placeholder="HTTPS://"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase">Portfolio / Lookbook Link</label>
                                    <input
                                        required
                                        name="portfolio_url"
                                        value={formData.portfolio_url}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b border-border py-3 outline-none focus:border-foreground transition-colors font-serif text-xl font-light"
                                        placeholder="DROPBOX, GOOGLE DRIVE, OR LINKEDIN"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase">Institutional Vision</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full bg-transparent border-b border-border py-3 outline-none focus:border-foreground transition-colors font-serif text-xl font-light resize-none"
                                        placeholder="TELL US ABOUT YOUR HERITAGE AND CRAFT..."
                                    />
                                </div>

                                <div className="pt-8">
                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="group relative w-full lg:w-auto font-sans text-[11px] editorial-spacing px-16 py-6 overflow-hidden flex items-center justify-center gap-4 bg-black text-white disabled:opacity-50"
                                    >
                                        <span className="relative z-10 uppercase tracking-[0.3em]">
                                            {isSubmitting ? "Submitting to Archive" : "Submit Portfolio"}
                                        </span>
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                                        ) : (
                                            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-2 transition-transform" />
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Apply;
