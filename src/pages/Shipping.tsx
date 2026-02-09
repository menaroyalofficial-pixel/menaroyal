import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Globe, ShieldCheck, Clock, Truck } from "lucide-react";

const Shipping = () => {
    return (
        <Layout>
            <div className="bg-background min-h-screen">
                <div className="pt-32 pb-24 border-b border-border">
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
                        <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-6 uppercase tracking-[0.3em]">
                            Logistics & Care
                        </p>
                        <h1 className="font-serif text-5xl lg:text-8xl font-light text-foreground tracking-tighter">
                            Global <span className="italic">Concierge</span>
                        </h1>
                        <p className="font-sans text-xs text-muted-foreground mt-8 max-w-xl mx-auto leading-relaxed editorial-spacing font-light">
                            MENA ROYAL provides an end-to-end white-glove logistics service, connecting regional ateliers with a global discerne clientele.
                        </p>
                    </div>
                </div>

                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
                        {[
                            {
                                icon: <Globe className="w-8 h-8 stroke-[1px]" />,
                                title: "Worldwide Delivery",
                                description: "We ship to over 190 countries using express priority services."
                            },
                            {
                                icon: <ShieldCheck className="w-8 h-8 stroke-[1px]" />,
                                title: "Secure Archive",
                                description: "Every shipment is fully insured and tracked from the atelier to your door."
                            },
                            {
                                icon: <Clock className="w-8 h-8 stroke-[1px]" />,
                                title: "Priority Service",
                                description: "Typical delivery window of 3-5 business days for archival pieces."
                            },
                            {
                                icon: <Truck className="w-8 h-8 stroke-[1px]" />,
                                title: "White Glove",
                                description: "Local concierge available for specialized delivery in major cities."
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                className="space-y-6"
                            >
                                <div className="text-foreground/40">{item.icon}</div>
                                <h3 className="font-serif text-2xl font-light">{item.title}</h3>
                                <p className="font-sans text-xs text-muted-foreground leading-relaxed font-light editorial-spacing uppercase">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-48 pt-24 border-t border-border">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                            <div>
                                <h2 className="font-serif text-4xl lg:text-6xl font-light leading-tight mb-8">
                                    Institutional <br /><span className="italic">Standard</span>
                                </h2>
                                <p className="font-sans text-sm text-foreground/70 leading-relaxed font-light mb-12">
                                    Our logistics network is built on the same principles as the houses we represent: precision, care, and a deep respect for heritage. We handle every archival position as a piece of history.
                                </p>
                                <a href="/stories" className="font-sans text-[10px] editorial-spacing border border-foreground px-12 py-5 hover:bg-black hover:text-white transition-all inline-block">
                                    SHIPPING POLICY
                                </a>
                            </div>
                            <div className="aspect-[16/10] overflow-hidden bg-secondary/20 grayscale">
                                <img
                                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop"
                                    alt="Logistics"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Shipping;
