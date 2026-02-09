import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-black">
      <motion.div
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0"
      >
        <img
          src={heroImage}
          alt="MENA Luxury"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </motion.div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl"
        >
          <p className="font-sans text-[10px] md:text-xs editorial-spacing text-white/80 mb-8 tracking-[0.3em]">
            Institutional Luxury & Craftsmanship
          </p>
          <h1 className="font-serif text-5xl md:text-8xl lg:text-9xl font-light text-white leading-[0.9] tracking-tighter mb-10">
            MENA<br />
            <span className="italic">ROYAL</span>
          </h1>
          <p className="font-sans text-xs md:text-sm text-white/60 mt-6 max-w-lg mx-auto leading-relaxed editorial-spacing font-light">
            A curated portal to the finest design houses of the Middle East.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-16 flex flex-col md:flex-row gap-6"
        >
          <Link
            to="/shop"
            className="group relative font-sans text-[10px] editorial-spacing px-12 py-5 overflow-hidden"
          >
            <span className="relative z-10 text-white group-hover:text-black transition-colors duration-500">Shop Collection</span>
            <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <div className="absolute inset-0 border border-white/30" />
          </Link>
          <Link
            to="/designers"
            className="font-sans text-[10px] editorial-spacing px-12 py-5 text-white/80 hover:text-white transition-colors duration-300"
          >
            Meet the Houses
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="font-sans text-[8px] editorial-spacing text-white/40 rotate-90 origin-left translate-x-1">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
