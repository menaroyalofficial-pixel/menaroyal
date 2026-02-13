import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Heart, ShoppingBag, Menu, X, Search, User } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import SearchOverlay from "./SearchOverlay";
import { supabase } from "@/lib/supabase";

const navLinks = [
  { label: "Abayas", href: "/shop/abaya" },
  { label: "Caftans", href: "/shop/caftan" },
  { label: "Djellabas", href: "/shop/djellaba" },
  { label: "Maison", href: "/shop/maison" },
  { label: "Jewelry", href: "/shop/jewelry" },
  { label: "Stories", href: "/stories" },
  { label: "The Houses", href: "/designers" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, wishlistCount } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const isHome = location.pathname === "/";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAccountClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/account");
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const headerBg = isHome
    ? (scrolled ? "bg-background/90 backdrop-blur-md border-b border-border h-20" : "bg-transparent h-24")
    : "bg-background/90 backdrop-blur-md border-b border-border h-20";

  const textColor = isHome
    ? (scrolled ? "text-foreground" : "text-primary-foreground")
    : "text-foreground";

  const subTextColor = isHome
    ? (scrolled ? "text-muted-foreground" : "text-primary-foreground/70")
    : "text-muted-foreground";

  return (
    <>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${headerBg}`}>
        <div className="mx-auto h-full max-w-[1440px] px-6 lg:px-12 flex items-center justify-between">
          {/* Left: Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10 flex-1">
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-[10px] font-sans font-medium editorial-spacing transition-all duration-300 hover:opacity-100 ${subTextColor} hover:text-foreground`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Center: Logo */}
          <div className="flex items-center justify-center lg:flex-1">
            <Link to="/" className="flex-shrink-0 group">
              <h1 className={`font-serif text-2xl lg:text-3xl font-light tracking-[0.2em] transition-all duration-500 ${textColor}`}>
                MENA<span className="font-bold">ROYAL</span>
              </h1>
            </Link>
          </div>

          {/* Right: Desktop Nav + Actions */}
          <div className="flex items-center justify-end gap-6 lg:flex-1">
            <nav className="hidden lg:flex items-center gap-10 mr-4">
              {navLinks.slice(3).map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-[10px] font-sans font-medium editorial-spacing transition-all duration-300 hover:opacity-100 ${subTextColor} hover:text-foreground`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className={`p-2 transition-all duration-300 hover:scale-110 ${subTextColor} hover:text-foreground`}
              >
                <Search className="w-4 h-4 stroke-[1.5px]" />
              </button>
              <Link
                to="/wishlist"
                className={`relative p-2 transition-all duration-300 hover:scale-110 ${subTextColor} hover:text-foreground`}
              >
                <Heart className="w-4 h-4 stroke-[1.5px]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 text-[8px] font-sans font-bold bg-foreground text-background rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                to="/cart"
                className={`relative p-2 transition-all duration-300 hover:scale-110 ${subTextColor} hover:text-foreground`}
              >
                <ShoppingBag className="w-4 h-4 stroke-[1.5px]" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 text-[8px] font-sans font-bold bg-foreground text-background rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={handleAccountClick}
                className={`p-2 transition-all duration-300 hover:scale-110 ${subTextColor} hover:text-foreground`}
              >
                <User className="w-4 h-4 stroke-[1.5px]" />
              </button>
            </div>

            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className={`w-5 h-5 ${textColor}`} />
              ) : (
                <Menu className={`w-5 h-5 ${textColor}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-background border-t border-border overflow-hidden"
            >
              <nav className="flex flex-col py-6 px-6 gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-sans font-medium editorial-spacing text-foreground hover:text-accent transition-colors py-2"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;
