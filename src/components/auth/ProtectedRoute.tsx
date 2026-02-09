import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const ProtectedRoute = ({ children, fallback = "/login" }: { children: React.ReactNode, fallback?: string }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setAuthenticated(!!session);
            setLoading(false);
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setAuthenticated(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-foreground/10 border-t-foreground rounded-full animate-spin" />
            </div>
        );
    }

    if (!authenticated) {
        return <Navigate to={fallback} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
