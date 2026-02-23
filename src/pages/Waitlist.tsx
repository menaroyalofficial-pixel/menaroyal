import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Loader2, Globe, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const Waitlist = () => {
    const [email, setEmail] = useState("");
    const [region, setRegion] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: supabaseError } = await supabase
                .from("institutional_leads")
                .insert([{
                    email: email.toLowerCase().trim(),
                    region,
                    status: "pending"
                }]);

            if (supabaseError) {
                if (supabaseError.code === '23505') {
                    setSubmitted(true); // Don't show error, just act like they joined successfully
                    return;
                }
                throw supabaseError;
            }

            setSubmitted(true);
        } catch (err: any) {
            console.error("Waitlist error:", err);
            setError("The archival system is temporarily congested. Please retry your entry.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.05)_0%,_transparent_50%)]" />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ duration: 3 }}
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay grayscale grayscale-100"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
            </div>

            {/* Header */}
            <header className="p-8 lg:p-12 z-20 flex justify-between items-center">
                <Link to="/" className="group">
                    <h1 className="font-serif text-2xl font-light tracking-[0.3em] text-white">
                        MENA<span className="font-bold">ROYAL</span>
                    </h1>
                </Link>
                <div className="flex items-center gap-8">
                    <span className="font-sans text-[8px] editorial-spacing text-white/40 hidden lg:block tracking-[0.4em] uppercase">Private Portal Access</span>
                    <Link to="/" className="font-sans text-[10px] editorial-spacing text-white/60 hover:text-white transition-opacity uppercase">
                        Exit
                    </Link>
                </div>
            </header>

            {/* Main Immersive Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 z-10 py-20">
                <div className="max-w-4xl w-full">
                    <AnimatePresence mode="wait">
                        {!submitted ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                className="flex flex-col items-center text-center"
                            >
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="mb-12 inline-flex items-center gap-4 px-6 py-2 border border-white/10 rounded-full bg-white/5 backdrop-blur-md"
                                >
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                    <span className="font-sans text-[9px] editorial-spacing tracking-[0.3em] text-white/80 uppercase">V2.0 Portal Now Deploying</span>
                                </motion.div>

                                <h2 className="font-serif text-6xl lg:text-9xl font-light tracking-tighter mb-12 leading-[0.9] text-white">
                                    The <span className="italic">Gateway</span> <br /> to Heritage
                                </h2>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20 text-left max-w-5xl">
                                    <div className="space-y-4">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                            <Shield className="w-3.5 h-3.5 text-white/60" />
                                        </div>
                                        <h3 className="font-serif text-lg italic font-light">Institutional Curation</h3>
                                        <p className="font-sans text-[10px] leading-relaxed text-white/40 editorial-spacing uppercase">Access the most exclusive archives of the MENA region's legendary houses before public availability.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                            <Zap className="w-3.5 h-3.5 text-white/60" />
                                        </div>
                                        <h3 className="font-serif text-lg italic font-light">Rapid Acquisition</h3>
                                        <p className="font-sans text-[10px] leading-relaxed text-white/40 editorial-spacing uppercase">A high-performance portal designed for elite collectors. Secure heritage pieces in seconds with seamless archival logistics.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                            <Globe className="w-3.5 h-3.5 text-white/60" />
                                        </div>
                                        <h3 className="font-serif text-lg italic font-light">Global Presence</h3>
                                        <p className="font-sans text-[10px] leading-relaxed text-white/40 editorial-spacing uppercase">Institutional logistics hubs in Dubai, Riyadh, and Casablanca ensuring your archive reaches you wherever you are.</p>
                                    </div>
                                </div>

                                <div className="max-w-md w-full mx-auto bg-white/5 backdrop-blur-xl p-10 lg:p-12 border border-white/10 rounded-2xl shadow-2xl">
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="space-y-2 text-left">
                                            <label className="font-sans text-[8px] editorial-spacing text-white/30 uppercase tracking-[0.2em]">Institutional Email</label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="Enter your address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-transparent border-b border-white/20 py-4 font-sans text-xs tracking-widest outline-none focus:border-white transition-all uppercase placeholder:text-white/10"
                                            />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="font-sans text-[8px] editorial-spacing text-white/30 uppercase tracking-[0.2em]">Territory</label>
                                            <div className="relative">
                                                <select
                                                    required
                                                    value={region}
                                                    onChange={(e) => setRegion(e.target.value)}
                                                    className="w-full bg-transparent border-b border-white/20 py-4 font-sans text-xs tracking-widest outline-none focus:border-white transition-all uppercase appearance-none cursor-pointer"
                                                >
                                                    <option value="" disabled className="bg-black">Select region</option>
                                                    <option value="gcc" className="bg-black">GCC (UAE, SAUDI, QATAR)</option>
                                                    <option value="na" className="bg-black">NORTH AFRICA (MOROCCO, EGYPT)</option>
                                                    <option value="lev" className="bg-black">LEVANT (LEBANON, JORDAN)</option>
                                                    <option value="int" className="bg-black">INTERNATIONAL</option>
                                                </select>
                                                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full relative py-6 bg-white text-black font-sans text-[11px] font-bold editorial-spacing hover:bg-white/90 transition-all flex items-center justify-center gap-4 group rounded-lg"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    REQUEST PORTAL INVITE
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>

                                        {error && (
                                            <p className="text-[9px] font-sans editorial-spacing text-red-500 uppercase tracking-widest leading-relaxed">
                                                {error}
                                            </p>
                                        )}
                                    </form>
                                </div>
                                <p className="mt-12 font-sans text-[8px] editorial-spacing text-white/20 tracking-[0.3em] uppercase max-w-xs leading-loose">
                                    Invitations are limited. Our curators review applications based on archive availability.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                className="flex flex-col items-center text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 12 }}
                                    className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center mb-12 bg-white/5 backdrop-blur-lg"
                                >
                                    <Check className="w-10 h-10 text-white stroke-[1px]" />
                                </motion.div>
                                <h2 className="font-serif text-6xl lg:text-8xl font-light mb-10 tracking-tighter text-white">
                                    Entry <span className="italic">Confirmed</span>
                                </h2>
                                <p className="font-sans text-xs editorial-spacing text-white/50 max-w-md mx-auto leading-loose uppercase tracking-[0.2em]">
                                    Your institutional intent for <span className="text-white font-bold">{email}</span> has been securely archived. A curator will reach out when a slot in the collective becomes available.
                                </p>
                                <div className="mt-20 flex flex-col items-center gap-8">
                                    <Link
                                        to="/"
                                        className="font-sans text-[10px] editorial-spacing text-white/30 hover:text-white border-b border-white/10 hover:border-white transition-all uppercase tracking-[0.3em] pb-1"
                                    >
                                        Close Portal
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Aesthetic Detail Footer */}
            <footer className="p-8 lg:p-12 flex justify-between items-center z-10 border-t border-white/5">
                <p className="font-sans text-[8px] editorial-spacing text-white/20 tracking-[0.4em]">
                    SECURE ARCHIVE V2.4 // {new Date().getFullYear()}
                </p>
                <div className="flex gap-8">
                    <span className="font-sans text-[8px] editorial-spacing text-white/10 uppercase tracking-[0.3em]">Institutional Grade</span>
                    <span className="font-sans text-[8px] editorial-spacing text-white/10 uppercase tracking-[0.3em]">End-to-End Encryption</span>
                </div>
            </footer>
        </div>
    );
};

const ChevronDown = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export default Waitlist;
