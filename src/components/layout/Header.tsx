import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Heart, ShoppingBag, Menu, X, Search, User } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import SearchOverlay from "./SearchOverlay";
import { supabase } from "@/lib/supabase";
import MegaMenu from "./MegaMenu";

const navLinks = [
  { label: "Bridal", href: "/shop/bridal" },
  { label: "Wedding Guest", href: "/shop/wedding-guest" },
  { label: "Abayas", href: "/shop/abaya" },
  { label: "Caftans", href: "/shop/caftan" },
  { label: "Djellabas", href: "/shop/djellaba" },
  // TEMPORARY: Maison hidden - uncomment to reactivate
  // { label: "Maison", href: "/shop/maison" },
  { label: "Jewelry", href: "/shop/jewelry" },
  { label: "Stories", href: "/stories" },
  { label: "The Houses", href: "/designers" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
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

  // Close MegaMenu on route change
  useEffect(() => {
    setActiveMenu(null);
  }, [location.pathname]);

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
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${headerBg}`}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div className="mx-auto h-full max-w-[1440px] px-6 lg:px-12 flex items-center justify-between relative">

          {/* Left: Desktop Nav - Brand & Menu Triggers */}
          <div className="hidden lg:flex items-center gap-12 flex-1">
            <Link to="/" className="flex-shrink-0 group mr-8">
              <h1 className={`font-serif text-2xl lg:text-3xl font-light tracking-[0.2em] transition-all duration-500 ${textColor}`}>
                MENA<span className="font-bold">ROYAL</span>
              </h1>
            </Link>

            <nav className="flex items-center gap-10">
              <button
                onMouseEnter={() => setActiveMenu('occasion')}
                className={`text-[10px] font-sans font-medium editorial-spacing transition-all duration-300 hover:opacity-100 ${subTextColor} hover:text-foreground uppercase tracking-widest ${activeMenu === 'occasion' ? 'text-foreground' : ''}`}
              >
                Occasions
              </button>
              <button
                onMouseEnter={() => setActiveMenu('category')}
                className={`text-[10px] font-sans font-medium editorial-spacing transition-all duration-300 hover:opacity-100 ${subTextColor} hover:text-foreground uppercase tracking-widest ${activeMenu === 'category' ? 'text-foreground' : ''}`}
              >
                Categories
              </button>
              <button
                onMouseEnter={() => setActiveMenu('designers')}
                className={`text-[10px] font-sans font-medium editorial-spacing transition-all duration-300 hover:opacity-100 ${subTextColor} hover:text-foreground uppercase tracking-widest ${activeMenu === 'designers' ? 'text-foreground' : ''}`}
              >
                Designers
              </button>
              <Link
                to="/stories"
                className={`text-[10px] font-sans font-medium editorial-spacing transition-all duration-300 hover:opacity-100 ${subTextColor} hover:text-foreground uppercase tracking-widest`}
                onMouseEnter={() => setActiveMenu(null)}
              >
                Stories
              </Link>
            </nav>
          </div>

          {/* Center: Mobile Logo (Only visible on mobile) */}
          <div className="lg:hidden flex items-center justify-center flex-1">
            <Link to="/" className="flex-shrink-0 group">
              <h1 className={`font-serif text-2xl font-light tracking-[0.2em] transition-all duration-500 ${textColor}`}>
                MENA<span className="font-bold">ROYAL</span>
              </h1>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-6 lg:flex-none">
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

        {/* Mega Menu Component */}
        <MegaMenu activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-50 bg-background lg:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <span className="font-serif text-lg tracking-widest text-foreground">MENU</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-6">
                <ul className="space-y-6">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-serif text-3xl font-light text-foreground hover:text-muted-foreground transition-colors block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li className="pt-6 border-t border-border">
                    <Link
                      to="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="font-sans text-sm editorial-spacing text-foreground block mb-4"
                    >
                      MY ACCOUNT
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="font-sans text-sm editorial-spacing text-foreground block"
                    >
                      WISHLIST ({wishlistCount})
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
