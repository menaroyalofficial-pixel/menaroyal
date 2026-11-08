import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { emailService } from "@/services/emailService";

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

            // Dispatch Institutional Confirmation Email
            await emailService.sendWaitlistConfirmation(email.toLowerCase().trim());

            setSubmitted(true);
        } catch (err: any) {
            console.error("Waitlist error:", err);
            setError("SYSTEM CONGESTED. RETRY LATER.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#050505] text-white overflow-x-hidden selection:bg-white selection:text-black">
            {/* Editorial Background Detail */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[50vw] h-full bg-gradient-to-l from-white/[0.02] to-transparent" />
            </div>

            <main className="relative z-10 w-full flex flex-col items-center">
                {/* Section 1: Institutional Intro */}
                <section className="min-h-screen w-full flex flex-col items-center justify-center px-6 lg:px-12 py-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                        className="max-w-[1440px] w-full"
                    >
                        <header className="mb-32">
                            <h1 className="font-serif text-3xl lg:text-4xl font-light tracking-[0.5em] uppercase text-white cursor-default">
                                MENA<span className="font-bold">ROYAL</span>
                            </h1>
                        </header>

                        <div className="space-y-12">
                            <p className="font-sans text-[10px] lg:text-[11px] editorial-spacing tracking-[0.6em] text-white/40 uppercase mb-4">
                                The Institutional Portal
                            </p>
                            <h2 className="font-serif text-6xl lg:text-[10rem] font-light tracking-tighter leading-[0.85] text-white uppercase italic">
                                The <br className="hidden lg:block" /> Archive
                            </h2>
                            <div className="h-px w-24 bg-white/20 mx-auto my-16" />
                            <p className="font-sans text-xs lg:text-[13px] leading-relaxed text-white/50 max-w-lg mx-auto uppercase tracking-[0.25em] editorial-spacing font-light">
                                A curated ecosystem for heritage collectors and archival seekers. <br /> Access is restricted by territory and invitation.
                            </p>
                        </div>

                        {/* Visual Anchor */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.1 }}
                            transition={{ delay: 2, duration: 2 }}
                            className="mt-32 font-sans text-[9px] tracking-[0.4em] uppercase animate-pulse"
                        >
                            Scroll to enter
                        </motion.div>
                    </motion.div>
                </section>

                {/* Section 2: Trust & Heritage */}
                <section className="min-h-screen w-full bg-white text-black flex items-center justify-center px-6 lg:px-24 py-32 overflow-hidden">
                    <div className="max-w-[1440px] w-full grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
                        <div className="lg:col-span-5 space-y-12">
                            <p className="font-sans text-[10px] editorial-spacing tracking-[0.4em] text-black/40 uppercase">
                                Our Vision
                            </p>
                            <h3 className="font-serif text-5xl lg:text-7xl font-light leading-tight tracking-tighter italic">
                                Archiving <br /> Excellence
                            </h3>
                            <div className="space-y-8 font-sans text-sm lg:text-base leading-relaxed text-black/70 font-light max-w-md">
                                <p>
                                    MENA ROYAL serves as the definitive authority in archiving Middle Eastern excellence. We do not merely sell; we curate heritage.
                                </p>
                                <p>
                                    We start in the Gulf, with the design houses of Saudi Arabia, the UAE and Kuwait, and bring in the international houses of the wider region: Lebanon, Jordan, Egypt and beyond.
                                </p>
                            </div>
                        </div>
                        <div className="lg:col-span-1" />
                        <div className="lg:col-span-6 relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.5 }}
                                className="aspect-[4/5] bg-black/5 overflow-hidden"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=2000&auto=format&fit=crop"
                                    alt="Couture Archive"
                                    className="w-full h-full object-cover grayscale brightness-90 hover:scale-105 transition-transform duration-1000"
                                />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Section 3: The Form */}
                <section className="min-h-screen w-full flex flex-col items-center justify-center px-6 lg:px-12 py-32 bg-black">
                    <div className="max-w-[1440px] w-full flex flex-col items-center">
                        <AnimatePresence mode="wait">
                            {!submitted ? (
                                <motion.div
                                    key="form-container"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1 }}
                                    className="w-full flex flex-col items-center"
                                >
                                    <div className="text-center mb-16 lg:mb-24">
                                        <h4 className="font-serif text-4xl lg:text-6xl font-light tracking-tighter text-white uppercase italic mb-8">
                                            Request Entry
                                        </h4>
                                        <p className="font-sans text-[10px] lg:text-xs text-white/40 uppercase tracking-[0.3em] font-light max-w-xs mx-auto">
                                            Please provide your institutional details to begin the screening process.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-16">
                                        <div className="space-y-12">
                                            <div className="relative border-b border-white/10 group focus-within:border-white transition-colors">
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="CORRESPONDENCE EMAIL"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full bg-transparent py-4 font-sans text-[10px] lg:text-[11px] tracking-[0.4em] outline-none placeholder:text-white/10 uppercase transition-all"
                                                />
                                            </div>
                                            <div className="relative border-b border-white/10 group focus-within:border-white transition-colors">
                                                <select
                                                    required
                                                    value={region}
                                                    onChange={(e) => setRegion(e.target.value)}
                                                    className="w-full bg-transparent py-4 font-sans text-[10px] lg:text-[11px] tracking-[0.4em] outline-none appearance-none cursor-pointer text-white/50 hover:text-white uppercase"
                                                >
                                                    <option value="" disabled className="bg-black">SELECT TERRITORY</option>
                                                    <option value="gcc" className="bg-black text-white">GULF (KSA, UAE, KUWAIT, QATAR)</option>
                                                    <option value="lev" className="bg-black text-white">LEVANT (LEBANON, JORDAN)</option>
                                                    <option value="na" className="bg-black text-white">NORTH AFRICA (EGYPT, MOROCCO)</option>
                                                    <option value="int" className="bg-black text-white">INTERNATIONAL ARCHIVE</option>
                                                </select>
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity">
                                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-6 border border-white font-sans text-[10px] lg:text-[11px] tracking-[0.6em] hover:bg-white hover:text-black transition-all duration-1000 uppercase bg-transparent"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                            ) : (
                                                "REGISTER FOR ACCESS"
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
                                        Confirmed
                                    </h2>
                                    <p className="font-sans text-[10px] lg:text-xs text-white/40 max-w-sm mx-auto uppercase tracking-[0.3em] leading-loose">
                                        Your correspondence has been logged. Our curators will review your territory's availability and dispatch an invitation shortly.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                <footer className="w-full max-w-[1440px] px-12 py-24 flex flex-col items-center gap-12 border-t border-white/5">
                    <div className="h-px w-24 bg-white/20" />
                    <div className="flex flex-col items-center gap-4 text-center">
                        <p className="font-sans text-[8px] tracking-[0.6em] text-white/20 uppercase">
                            MENA ROYAL © {new Date().getFullYear()} // INSTITUTIONAL COLLECTIVE
                        </p>
                        <p className="font-sans text-[7px] tracking-[0.4em] text-white/10 uppercase max-w-xs">
                            Access restricted to registered correspondence. All archival records are private.
                        </p>
                    </div>
                </footer>
            </main>

            {/* Aesthetic Borders / Frame */}
            <div className="fixed inset-0 pointer-events-none border-[20px] lg:border-[40px] border-black z-[100] hidden lg:block opacity-50" />
        </div>
    );
};

export default Waitlist;
