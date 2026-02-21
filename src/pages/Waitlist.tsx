import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";
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
                .from("waitlist")
                .insert([{
                    email: email.toLowerCase(),
                    region,
                    status: "pending"
                }]);

            if (supabaseError) {
                if (supabaseError.code === '23505') {
                    setError("Your email is already securely archived in our waiting list.");
                    return;
                }
                throw supabaseError;
            }

            setSubmitted(true);
        } catch (err: any) {
            console.error("Waitlist error:", err);
            setError("An archival error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
            {/* Background Subtle Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--muted)_0%,_transparent_100%)] opacity-30 pointer-events-none" />

            {/* Header (Minimal) */}
            <header className="p-8 lg:p-12 z-10 flex justify-between items-center">
                <Link to="/" className="group">
                    <h1 className="font-serif text-2xl font-light tracking-[0.2em]">
                        MENA<span className="font-bold">ROYAL</span>
                    </h1>
                </Link>
                <Link to="/about" className="font-sans text-[10px] editorial-spacing opacity-60 hover:opacity-100 transition-opacity">
                    THE ARCHIVE
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 z-10">
                <div className="max-w-3xl w-full text-center">
                    <AnimatePresence mode="wait">
                        {!submitted ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-8">
                                    Institutional Access
                                </p>
                                <h2 className="font-serif text-5xl lg:text-7xl font-light tracking-tighter mb-12 leading-[1.1]">
                                    Join the <span className="italic">Inner</span> Collective
                                </h2>
                                <p className="font-sans text-sm text-muted-foreground max-w-lg mx-auto mb-16 leading-relaxed opacity-70 uppercase tracking-widest text-[9px]">
                                    Private invitations for the archive are released seasonally.
                                    Secure your intent for early access to the heritage pieces.
                                </p>

                                <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
                                    <div className="relative group">
                                        <input
                                            type="email"
                                            required
                                            placeholder="EMAIL ADDRESS"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-transparent border-b border-border py-4 font-sans text-xs tracking-widest outline-none focus:border-foreground transition-colors uppercase"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <select
                                            required
                                            value={region}
                                            onChange={(e) => setRegion(e.target.value)}
                                            className="w-full bg-transparent border-b border-border py-4 font-sans text-xs tracking-widest outline-none focus:border-foreground transition-colors uppercase appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>SELECT YOUR REGION</option>
                                            <option value="gcc">GCC (UAE, SAUDI, QATAR)</option>
                                            <option value="na">NORTH AFRICA (MOROCCO, EGYPT)</option>
                                            <option value="lev">LEVANT (LEBANON, JORDAN)</option>
                                            <option value="int">INTERNATIONAL</option>
                                        </select>
                                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full mt-12 py-5 bg-foreground text-background font-sans text-[10px] editorial-spacing hover:bg-muted foreground hover:text-foreground border border-transparent hover:border-border transition-all flex items-center justify-center gap-3 group"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                REQUEST ACCESS
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>

                                    {error && (
                                        <p className="mt-4 text-[9px] font-sans editorial-spacing text-destructive">
                                            {error}
                                        </p>
                                    )}
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center mb-10">
                                    <Check className="w-6 h-6 text-foreground stroke-[1px]" />
                                </div>
                                <h2 className="font-serif text-4xl lg:text-5xl font-light mb-6 tracking-tight text-balance">
                                    Your intent has been archived.
                                </h2>
                                <p className="font-sans text-[10px] editorial-spacing text-muted-foreground max-w-sm mx-auto leading-loose opacity-60">
                                    A private invitation will be dispatched to <span className="text-foreground">{email}</span> when the next archive release is initiated.
                                </p>
                                <Link
                                    to="/"
                                    className="mt-16 font-sans text-[9px] editorial-spacing underline offset-4 hover:opacity-60 transition-opacity"
                                >
                                    RETURN TO HOME
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Footer (Minimal) */}
            <footer className="p-8 lg:p-12 text-center z-10">
                <p className="font-sans text-[8px] editorial-spacing opacity-30">
                    © {new Date().getFullYear()} MENA ROYAL ARCHIVE — ALL RIGHTS RESERVED
                </p>
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
