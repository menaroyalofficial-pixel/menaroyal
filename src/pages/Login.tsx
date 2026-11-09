import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Lock, Mail } from "lucide-react";

const Login = () => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName } }
                });
                if (error) throw error;
                toast.success("Membership requested. Check your email.");
            } else {
                const { data: { user }, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                // Smart Redirection based on role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user?.id)
                    .single();

                if (profile?.role === 'super_admin') navigate("/admin");
                else if (profile?.role === 'brand_admin') navigate("/designer");
                else navigate("/account");

                toast.success("Identity Verified.");
            }
        } catch (error: any) {
            toast.error(error.message || "Archive Access Denied.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="bg-background min-h-screen flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full"
                >
                    <div className="text-center mb-16">
                        <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-4 uppercase tracking-[0.2em]">
                            {mode === 'login' ? 'Members' : 'Become a member'}
                        </p>
                        <h1 className="font-serif text-5xl font-light text-foreground tracking-tighter">
                            Members <span className="italic">{mode === 'login' ? 'Entry' : 'Welcome'}</span>
                        </h1>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-4">
                            {mode === 'signup' && (
                                <input
                                    id="full-name"
                                    name="full_name"
                                    type="text"
                                    placeholder="FULL NAME"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-secondary/10 border border-border py-4 px-6 font-sans text-xs editorial-spacing outline-none focus:border-foreground transition-colors"
                                    required
                                />
                            )}
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="EMAIL ADDRESS"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-secondary/10 border border-border py-4 px-6 font-sans text-xs editorial-spacing outline-none focus:border-foreground transition-colors"
                                required
                            />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="PASSCODE"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-secondary/10 border border-border py-4 px-6 font-sans text-xs editorial-spacing outline-none focus:border-foreground transition-colors"
                                required
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-black text-white font-sans text-[10px] editorial-spacing py-5 hover:bg-neutral-800 transition-all uppercase disabled:opacity-50"
                        >
                            {loading ? "Verifying..." : mode === 'login' ? "Access Archive" : "Establish Membership"}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                            className="font-sans text-[9px] text-muted-foreground uppercase border-b border-transparent hover:border-muted-foreground transition-all editorial-spacing"
                        >
                            {mode === 'login' ? "Request new membership" : "Existing member entry"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
};

export default Login;
