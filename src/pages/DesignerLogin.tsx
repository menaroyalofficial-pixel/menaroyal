import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Building2, Key } from "lucide-react";

const DesignerLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkExisting = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                if (data?.role === 'brand_admin') navigate("/designer");
            }
        };
        checkExisting();
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user }, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user?.id)
                .single();

            if (profile?.role === 'brand_admin' || profile?.role === 'super_admin') {
                toast.success("Atelier Access Granted.");
                navigate("/designer");
            } else {
                await supabase.auth.signOut();
                toast.error("Account not linked to an active Atelier.");
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
                        <Building2 className="w-12 h-12 mx-auto mb-8 text-black opacity-20 stroke-[1px]" />
                        <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-4 uppercase tracking-[0.2em]">
                            Designer Heritage Portal
                        </p>
                        <h1 className="font-serif text-5xl font-light text-foreground tracking-tighter">
                            The <span className="italic">Atelier</span>
                        </h1>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-4">
                            <input
                                type="email"
                                placeholder="HOUSE EMAIL ADDRESS"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-secondary/10 border border-border py-4 px-6 font-sans text-xs editorial-spacing outline-none focus:border-foreground transition-colors"
                                required
                            />
                            <input
                                type="password"
                                placeholder="ACCESS KEY"
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
                            {loading ? "Authenticating..." : "Enter Atelier"}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="font-sans text-[9px] text-muted-foreground uppercase editorial-spacing">
                            Heritage partnership required for access.
                        </p>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
};

export default DesignerLogin;
