import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
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
                    setSubmitted(true);
                    return;
                }
                throw supabaseError;
            }

            setSubmitted(true);
        } catch (err: any) {
            console.error("Waitlist error:", err);
            setError("SYSTEM CONGESTED. RETRY LATER.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-between overflow-hidden selection:bg-white selection:text-black">
            {/* Minimal Header */}
            <header className="pt-20 lg:pt-24 z-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                >
                    <h1 className="font-serif text-3xl lg:text-4xl font-light tracking-[0.4em] uppercase text-white cursor-default">
                        MENA<span className="font-bold">ROYAL</span>
                    </h1>
                </motion.div>
            </header>

            {/* Main Editorial Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 z-10 w-full max-w-[1440px]">
                <AnimatePresence mode="wait">
                    {!submitted ? (
                        <motion.div
                            key="form-container"
                            initial={{ opacity: 0, scale: 0.99 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                            className="w-full flex flex-col items-center"
                        >
                            <div className="text-center mb-16 lg:mb-20">
                                <p className="font-sans text-[10px] editorial-spacing tracking-[0.5em] text-white/40 uppercase mb-8 cursor-default">
                                    Institutional Waitlist
                                </p>
                                <h2 className="font-serif text-5xl lg:text-8xl font-light tracking-tighter leading-[0.9] text-white uppercase mb-8 italic">
                                    The Archive
                                </h2>
                                <p className="font-sans text-[10px] lg:text-xs leading-relaxed text-white/50 max-w-sm mx-auto uppercase tracking-[0.2em] editorial-spacing cursor-default">
                                    Request access to our seasonal curation of heritage houses and artisanal excellence. Invitations are released on a restrained basis.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-12">
                                <div className="space-y-8">
                                    <div className="relative border-b border-white/10 group focus-within:border-white transition-colors">
                                        <input
                                            type="email"
                                            required
                                            placeholder="CORRESPONDENCE EMAIL"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-transparent py-4 font-sans text-[10px] tracking-[0.3em] outline-none placeholder:text-white/20 uppercase transition-all"
                                        />
                                    </div>
                                    <div className="relative border-b border-white/10 group focus-within:border-white transition-colors">
                                        <select
                                            required
                                            value={region}
                                            onChange={(e) => setRegion(e.target.value)}
                                            className="w-full bg-transparent py-4 font-sans text-[10px] tracking-[0.3em] outline-none appearance-none cursor-pointer text-white/80 uppercase"
                                        >
                                            <option value="" disabled className="bg-black">SELECT REGION</option>
                                            <option value="gcc" className="bg-black">GCC</option>
                                            <option value="na" className="bg-black">NORTH AFRICA</option>
                                            <option value="lev" className="bg-black">LEVANT</option>
                                            <option value="int" className="bg-black">INTERNATIONAL</option>
                                        </select>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-6 border border-white/20 font-sans text-[10px] tracking-[0.5em] hover:bg-white hover:text-black transition-all duration-700 uppercase group flex items-center justify-center gap-4 bg-transparent backdrop-blur-sm"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "REGISTER INTENT"
                                    )}
                                </button>

                                {error && (
                                    <p className="text-[9px] font-sans tracking-[0.2em] text-red-500 text-center uppercase">
                                        {error}
                                    </p>
                                )}
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success-container"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 2 }}
                            className="text-center"
                        >
                            <h2 className="font-serif text-5xl lg:text-7xl font-light mb-8 tracking-tighter text-white uppercase italic">
                                Archived
                            </h2>
                            <p className="font-sans text-[10px] lg:text-xs text-white/40 max-w-xs mx-auto uppercase tracking-[0.3em] leading-loose cursor-default">
                                Your correspondence has been logged. We will reach out when the archive expands to your territory.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Restricted Footer */}
            <footer className="pb-20 lg:pb-24 w-full px-12 z-10 flex flex-col items-center gap-4">
                <div className="h-px w-24 bg-white/10 mb-8" />
                <p className="font-sans text-[8px] tracking-[0.5em] text-white/20 uppercase cursor-default">
                    MENA ROYAL © {new Date().getFullYear()} // PRIVACY BY DESIGN
                </p>
            </footer>

            {/* Atmospheric Restraint */}
            <div className="fixed inset-0 pointer-events-none border-[40px] border-black z-[100] hidden lg:block" />
        </div>
    );
};

export default Waitlist;
