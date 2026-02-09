import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedBrands from "@/components/home/FeaturedBrands";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import EditorialSection from "@/components/home/EditorialSection";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedProducts />
      <CategoryShowcase />
      <FeaturedBrands />
      <EditorialSection />

      {/* Brand CTA */}
      <section className="py-32 lg:py-48 bg-white border-t border-border overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-8">
                Institutional Partnership
              </p>
              <h2 className="font-serif text-4xl lg:text-7xl font-light text-foreground leading-[0.9] mb-12">
                Join the <span className="italic">Collective</span>
              </h2>
              <p className="font-sans text-xs text-muted-foreground max-w-md mb-12 leading-relaxed editorial-spacing font-light">
                Elevate your heritage design house to a global institutional stage. We provide the infrastructure for excellence.
              </p>
              <Link
                to="/apply"
                className="group relative font-sans text-[10px] editorial-spacing px-12 py-5 overflow-hidden inline-block"
              >
                <span className="relative z-10 text-black group-hover:text-white transition-colors duration-500 uppercase tracking-[0.3em]">Apply for Archival</span>
                <div className="absolute inset-0 bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                <div className="absolute inset-0 border border-black" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-square lg:aspect-video overflow-hidden bg-secondary/20"
            >
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000"
                alt="Luxury Workshop"
                className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 border-[40px] border-white/10" />
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
