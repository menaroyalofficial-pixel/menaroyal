import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

interface MenuItem {
    label: string;
    href: string;
}

interface MenuSection {
    title: string;
    items: MenuItem[];
}

interface MegaMenuProps {
    activeMenu: string | null;
    setActiveMenu: (menu: string | null) => void;
}

const menuData: Record<string, MenuSection[]> = {
    occasion: [
        {
            title: "Bridal",
            items: [
                { label: "Wedding Gowns", href: "/shop/bridal?type=gown" },
                { label: "Bridal Caftans", href: "/shop/bridal?type=caftan" },
                { label: "Bridal Abayas", href: "/shop/bridal?type=abaya" },
                { label: "Bridal Jewelry", href: "/shop/bridal?type=jewelry" },
            ]
        },
        {
            title: "Wedding Guest",
            items: [
                { label: "Guest Caftans", href: "/shop/wedding-guest?type=caftan" },
                { label: "Guest Evening Dresses", href: "/shop/wedding-guest?type=dress" },
                { label: "Guest Abayas", href: "/shop/wedding-guest?type=abaya" },
                { label: "Guest Jewelry", href: "/shop/wedding-guest?type=jewelry" },
            ]
        },
        {
            title: "Special Occasions",
            items: [
                { label: "Luxury Caftans", href: "/shop/special-occasions?type=caftan" },
                { label: "Evening Gowns", href: "/shop/special-occasions?type=gown" },
                { label: "Traditional Djellabas", href: "/shop/special-occasions?type=djellaba" },
                { label: "Statement Jewelry", href: "/shop/special-occasions?type=jewelry" },
            ]
        },
        {
            title: "Everyday Luxury",
            items: [
                { label: "Casual Abayas", href: "/shop/everyday-luxury?type=abaya" },
                { label: "Modern Caftans", href: "/shop/everyday-luxury?type=caftan" },
                { label: "Daily Jewelry", href: "/shop/everyday-luxury?type=jewelry" },
            ]
        }
    ],
    category: [
        {
            title: "Fashion",
            items: [
                { label: "Caftans & Takchitas", href: "/shop/caftan" },
                { label: "Abayas", href: "/shop/abaya" },
                { label: "Evening Dresses", href: "/shop/evening" },
                { label: "Djellabas", href: "/shop/djellaba" },
                { label: "Traditional Gowns", href: "/shop/traditional" },
            ]
        },
        {
            title: "Jewelry",
            items: [
                { label: "Necklaces", href: "/shop/jewelry?type=necklace" },
                { label: "Earrings", href: "/shop/jewelry?type=earrings" },
                { label: "Bracelets", href: "/shop/jewelry?type=bracelet" },
                { label: "Rings", href: "/shop/jewelry?type=ring" },
            ]
        },
        // {
        //   title: "Maison",
        //   items: [
        //     { label: "Decorative Items", href: "/shop/maison?type=decor" },
        //     { label: "Textiles", href: "/shop/maison?type=textile" },
        //     { label: "Art", href: "/shop/maison?type=art" },
        //     { label: "Tableware", href: "/shop/maison?type=tableware" },
        //   ]
        // },
        {
            title: "Bridal Collection",
            items: [
                { label: "All Bridal Items", href: "/shop/bridal" },
            ]
        }
    ],
    designers: [
        {
            title: "By Region",
            items: [
                { label: "All Designers", href: "/designers" },
                { label: "Moroccan Designers", href: "/designers?origin=morocco" },
                { label: "UAE Designers", href: "/designers?origin=uae" },
                { label: "Egyptian Designers", href: "/designers?origin=egypt" },
                { label: "Palestinian Designers", href: "/designers?origin=palestine" },
                { label: "Lebanese Designers", href: "/designers?origin=lebanon" },
            ]
        }
    ]
};

const MegaMenu = ({ activeMenu, setActiveMenu }: MegaMenuProps) => {
    const content = activeMenu ? menuData[activeMenu] : [];

    if (!activeMenu || !content) return null;

    return (
        <AnimatePresence>
            <motion.div
                key="mega-menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 w-full bg-white border-b border-border z-50 shadow-sm"
                onMouseLeave={() => setActiveMenu(null)}
            >
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {content.map((section, idx) => (
                            <div key={idx} className="space-y-6">
                                <h3 className="font-serif text-lg font-light text-foreground uppercase tracking-wider">{section.title}</h3>
                                <ul className="space-y-3">
                                    {section.items.map((item, itemIdx) => (
                                        <li key={itemIdx}>
                                            <Link
                                                to={item.href}
                                                className="font-sans text-xs editorial-spacing text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider block py-1"
                                                onClick={() => setActiveMenu(null)}
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Optional: Add a featured image or promotion in the menu - Keeping it simpler for now */}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MegaMenu;
