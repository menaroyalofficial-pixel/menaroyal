import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/product/ProductCard";
import { brandService } from "@/services/brandService";
import { productService } from "@/services/productService";
import { motion } from "framer-motion";
import { MapPin, Loader2, Globe, Instagram, ArrowUpRight } from "lucide-react";

const BrandPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [brand, setBrand] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandData = async (isLoadMore = false) => {
      if (!slug) return;
      if (!isLoadMore) setLoading(true);

      try {
        const brandData = await brandService.getBrandBySlug(slug);
        setBrand(brandData);

        if (brandData) {
          // Dynamic SEO Title
          document.title = `${brandData.name} | MENA ROYAL — Institutional Archive`;

          const { products: fetchedProducts } = await productService.getProducts({
            brandId: brandData.id,
            page: isLoadMore ? Math.floor(products.length / 24) + 1 : 1,
            pageSize: 24
          });

          if (isLoadMore) {
            setProducts(prev => [...prev, ...fetchedProducts]);
          } else {
            setProducts(fetchedProducts || []);
          }
        }
      } catch (error) {
        console.error("Archive House Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrandData();

    return () => {
      document.title = "MENA ROYAL — The Authority on MENA Design";
    };
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center space-y-8">
          <Loader2 className="w-8 h-8 animate-spin text-foreground opacity-20" />
          <p className="font-sans text-[10px] editorial-spacing uppercase opacity-40">Opening House Archives...</p>
        </div>
      </Layout>
    );
  }

  if (!brand) {
    return (
      <Layout>
        <div className="pt-48 pb-40 text-center">
          <h1 className="font-serif text-2xl text-foreground italic mb-8">House Registry Not Found</h1>
          <Link to="/designers" className="font-sans text-[10px] editorial-spacing text-foreground border-b border-foreground/30 pb-1 hover:border-foreground transition-all uppercase">
            Directory of Houses
          </Link>
        </div>
      </Layout>
    );
  }

  // A house either has a written history or it does not, and the page should be honest
  // about which. 200 characters is the line between a real entry and a caption.
  const hasStory = Boolean(brand.story && brand.story.trim().length > 200);

  const COUNTRY_NAMES: Record<string, string> = {
    SA: "Saudi Arabia", AE: "United Arab Emirates", QA: "Qatar", KW: "Kuwait",
    BH: "Bahrain", OM: "Oman", EG: "Egypt", LB: "Lebanon", JO: "Jordan",
    PS: "Palestine", SY: "Syria", IQ: "Iraq", YE: "Yemen", SD: "Sudan",
    MA: "Morocco", TN: "Tunisia", DZ: "Algeria", LY: "Libya", MR: "Mauritania",
  };
  const TIER_NAMES: Record<string, string> = {
    atelier: "Atelier — handwork, made to order",
    maison: "Maison — established house",
    contemporary: "Contemporary — independent label",
  };

  const links = [
    brand.website && {
      href: brand.website.startsWith("http") ? brand.website : `https://${brand.website}`,
      label: brand.website.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      Icon: Globe,
    },
    brand.instagram && {
      href: `https://instagram.com/${brand.instagram}`,
      label: `@${brand.instagram}`,
      Icon: Instagram,
    },
  ].filter(Boolean) as { href: string; label: string; Icon: any }[];

  const record = [
    { term: "Origin", value: COUNTRY_NAMES[brand.country] || brand.country || "—" },
    brand.category && { term: "Discipline", value: String(brand.category).replace(/\b\w/g, (c: string) => c.toUpperCase()) },
    brand.tier && TIER_NAMES[brand.tier] && { term: "Classification", value: TIER_NAMES[brand.tier] },
    brand.name_ar && { term: "Also known as", value: brand.name_ar },
  ].filter(Boolean) as { term: string; value: string }[];

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        {/* Immersive Hero */}
        <div className="relative h-[80vh] overflow-hidden">
          <motion.img
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            src={brand.cover_image || brand.logo || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000"}
            alt={brand.name}
            className="w-full h-full object-cover grayscale brightness-[0.7] contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="font-sans text-[10px] editorial-spacing text-white/50 mb-8 flex items-center justify-center gap-3 uppercase tracking-[0.4em]">
                  <MapPin className="w-3 h-3 text-white/30" /> {brand.country || "MENA"}
                </p>
                <h1 className="font-serif text-6xl lg:text-9xl font-light text-white tracking-widest uppercase mb-12">
                  {brand.name}
                </h1>
                <div className="h-[1px] w-24 bg-white/20 mx-auto" />
              </motion.div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-32">
          {/* House Narrative — a full essay when we have one, an archive record when we don't.
              A one-line description set in an essay layout reads as broken; the same line
              set as a catalogue entry reads as complete. Same data, different frame. */}
          {hasStory ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32 mb-48 items-start">
              <div className="lg:col-span-5 sticky top-48">
                <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-8 uppercase tracking-[0.25em]">
                  The Heritage
                </p>
                <h2 className="font-serif text-4xl lg:text-6xl font-light leading-[1.1] text-foreground tracking-tighter uppercase">
                  Archiving<br /><span className="italic">Craftsmanship</span>
                </h2>
                {links.length > 0 && (
                  <div className="mt-12 flex flex-col gap-3">
                    {links.map((l) => (
                      <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                         className="group font-sans text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-3">
                        <l.Icon className="w-3 h-3" /> {l.label}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div className="lg:col-span-7">
                {brand.story.split(/\n\n+/).map((para: string, i: number) => (
                  <p key={i} className={`font-sans text-lg lg:text-xl text-foreground/80 font-light leading-relaxed ${i === 0 ? "first-letter:text-6xl first-letter:font-serif first-letter:mr-4 first-letter:float-left first-letter:text-foreground" : "mt-8"}`}>
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32 mb-48 items-start">
              <div className="lg:col-span-5 sticky top-48">
                <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-8 uppercase tracking-[0.25em]">
                  The Record
                </p>
                <h2 className="font-serif text-4xl lg:text-6xl font-light leading-[1.1] text-foreground tracking-tighter uppercase">
                  Archive<br /><span className="italic">Entry</span>
                </h2>
              </div>

              <div className="lg:col-span-7">
                {brand.description && (
                  <p className="font-serif text-2xl lg:text-3xl font-light italic leading-snug text-foreground/90 mb-16">
                    {brand.description}
                  </p>
                )}

                <dl className="border-t border-border">
                  {record.map(({ term, value }) => (
                    <div key={term} className="grid grid-cols-3 gap-6 py-5 border-b border-border">
                      <dt className="font-sans text-[10px] uppercase tracking-[0.25em] text-muted-foreground pt-1">{term}</dt>
                      <dd className="col-span-2 font-sans text-base text-foreground/90">{value}</dd>
                    </div>
                  ))}
                </dl>

                {links.length > 0 && (
                  <div className="flex flex-wrap gap-x-10 gap-y-4 mt-12">
                    {links.map((l) => (
                      <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                         className="group font-sans text-[11px] uppercase tracking-[0.2em] text-foreground border-b border-border hover:border-foreground pb-1 transition-colors flex items-center gap-3">
                        <l.Icon className="w-3 h-3" /> {l.label}
                        <ArrowUpRight className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="mt-20 border-t border-border pt-10">
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-xl">
                    This entry was compiled from publicly available sources. Fuller documentation
                    of the house is in progress.
                  </p>
                  <a href={`mailto:hello@menaroyal.com?subject=${encodeURIComponent("Claim listing: " + brand.name)}`}
                     className="inline-block mt-6 font-sans text-[11px] uppercase tracking-[0.25em] border border-foreground px-8 py-4 hover:bg-foreground hover:text-background transition-colors">
                    Claim this house
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* House Exhibition — only promised when there is something to show. */}
          {products.length > 0 && (
            <div className="border-t border-border pt-32">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-8">
                <div>
                  <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-4 uppercase tracking-[0.2em]">
                    Seasonal Selection
                  </p>
                  <h2 className="font-serif text-5xl lg:text-7xl font-light tracking-tighter uppercase">
                    The <span className="italic">Collection</span>
                  </h2>
                </div>
                <p className="font-sans text-[10px] text-muted-foreground uppercase editorial-spacing opacity-50">
                  Displaying {products.length} Curated Exhibits
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BrandPage;
