import { Link } from "react-router-dom";
import { useState } from "react";
import { brandService } from "@/services/brandService";
import { emailService } from "@/services/emailService";
import { toast } from "sonner";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    try {
      await brandService.subscribeToJournal(email);
      // Send Welcome Email
      await emailService.sendNewsletterWelcome(email);

      toast.success("Welcome to the Collective Journal.");
      setEmail("");
    } catch (error: any) {
      console.error("Archive Subscription Error:", error.message || error);
      if (error.code === '23505') { // Postgres duplicate key error
        toast.info("This email is already archived in our Journal.");
      } else {
        toast.error(`Archival Error: ${error.message || "Please check the console"}`);
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-black text-white border-t border-white/5">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-24 lg:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <h2 className="font-serif text-3xl lg:text-4xl font-light tracking-[0.2em] mb-8">
              MENA<span className="font-bold">ROYAL</span>
            </h2>
            <p className="font-sans text-xs text-white/50 leading-relaxed max-w-xs editorial-spacing font-light">
              The institutional portal for Middle Eastern luxury. Curating heritage and contemporary craft for a global audience.
            </p>
            <div className="mt-12 flex gap-6">
              {["Instagram", "LinkedIn", "Pinterest"].map(social => (
                <span key={social} className="font-sans text-[8px] editorial-spacing text-white/40 hover:text-white transition-colors cursor-pointer border-b border-transparent hover:border-white pb-0.5">
                  {social}
                </span>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="lg:col-span-2">
            <h3 className="font-sans text-[10px] editorial-spacing mb-8 text-white/30">The Shop</h3>
            <ul className="space-y-4">
              {/* TEMPORARY: Maison hidden - restore by adding "Maison" back to array */}
              {["Bridal", "Fashion", "Jewelry"].map((item) => (
                <li key={item}>
                  <Link
                    to={`/shop/${item.toLowerCase()}`}
                    className="font-sans text-[10px] editorial-spacing text-white/60 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Members */}
          <div className="lg:col-span-2">
            <h3 className="font-sans text-[10px] editorial-spacing mb-8 text-white/30">Members</h3>
            <ul className="space-y-4">
              {[
                { label: "About Us", href: "/about" },
                { label: "FAQ", href: "/faq" },
                { label: "The Houses", href: "/designers" },
                { label: "Editorial", href: "/editorial" },
                { label: "Members", href: "/waitlist" },
                { label: "Global Shipping", href: "/shipping" },
                { label: "Verify a piece", href: "/verify" },
                { label: "Apply as a founding house", href: "/apply" },
                { label: "Designer Atelier", href: "/designer/login" },
                { label: "Admin Vault", href: "/admin/login" }
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="font-sans text-[10px] editorial-spacing text-white/60 hover:text-white transition-colors"
                  >
                    {item.label.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-4">
            <h3 className="font-sans text-[10px] editorial-spacing mb-8 text-white/30">Journal Archive</h3>
            <p className="font-sans text-xs text-white/50 mb-6 leading-relaxed max-w-xs">
              Subscribe to receive updates on new exhibits and designer narratives from the MENA region.
            </p>
            <form onSubmit={handleSubscribe} className="relative border-b border-white/20 pb-2 flex items-center">
              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL ADDRESS"
                className="bg-transparent border-none outline-none font-sans text-[10px] editorial-spacing w-full text-white placeholder:text-white/20"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="font-sans text-[10px] editorial-spacing text-white hover:opacity-60 transition-opacity ml-4 disabled:opacity-30"
              >
                {isSubscribing ? "..." : "ARCHIVE"}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="font-sans text-[8px] editorial-spacing text-white/20">
            © 2026 MENA ROYAL COLLECTIVE. ALL ASSETS ARCHIVED.
          </p>
          <div className="flex gap-8">
            <Link to="/privacy" className="font-sans text-[8px] editorial-spacing text-white/20 hover:text-white/40 uppercase">Privacy Policy</Link>
            <Link to="/terms" className="font-sans text-[8px] editorial-spacing text-white/20 hover:text-white/40 uppercase">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
