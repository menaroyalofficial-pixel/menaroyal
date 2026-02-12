import { useNavigate, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Heart, User, Search } from "lucide-react";
import { motion } from "framer-motion";

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { id: 'home', icon: Home, label: 'Home', path: '/' },
        { id: 'shop', icon: Search, label: 'Explore', path: '/shop' },
        { id: 'cart', icon: ShoppingBag, label: 'Archive', path: '/cart' },
        { id: 'wishlist', icon: Heart, label: 'Wishlist', path: '/wishlist' },
        { id: 'account', icon: User, label: 'Vault', path: '/account' },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-border z-[100] pb-safe">
            <div className="flex items-center justify-around h-20 px-4">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            className="flex flex-col items-center justify-center gap-1.5 w-16 h-full relative"
                        >
                            <tab.icon
                                className={`w-5 h-5 transition-all duration-500 ${isActive ? 'text-black scale-110' : 'text-muted-foreground opacity-40'}`}
                                strokeWidth={isActive ? 2 : 1.5}
                            />
                            <span className={`font-sans text-[7px] uppercase tracking-[0.2em] transition-all duration-500 ${isActive ? 'text-black font-bold' : 'text-muted-foreground opacity-40'}`}>
                                {tab.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="bottomNavIndicator"
                                    className="absolute -top-1 w-1 h-1 bg-black rounded-full"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
