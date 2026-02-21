import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";

const About = () => {
    return (
        <Layout>
            <div className="bg-background min-h-screen">
                {/* Hero Section */}
                <div className="pt-32 pb-16 border-b border-border">
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-6 uppercase tracking-[0.3em]">
                                Our Story
                            </p>
                            <h1 className="font-serif text-5xl lg:text-8xl font-light text-foreground tracking-tighter mb-8">
                                The Archive
                            </h1>
                            <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                MENA ROYAL is a curated platform celebrating the finest artisanal fashion from the Middle East and North Africa.
                                We partner with heritage ateliers and contemporary designers to bring you exclusive pieces that honor tradition while embracing modernity.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Mission Section */}
                <div className="py-24 lg:py-32">
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2 className="font-serif text-4xl lg:text-6xl font-light mb-8 tracking-tight">
                                    Our Mission
                                </h2>
                                <div className="space-y-6 font-sans text-sm text-muted-foreground leading-relaxed">
                                    <p>
                                        We believe in preserving the rich heritage of MENA craftsmanship while providing a global platform
                                        for talented designers to showcase their work. Each piece in our collection tells a story of
                                        centuries-old techniques, cultural significance, and artistic excellence.
                                    </p>
                                    <p>
                                        From hand-embroidered caftans to contemporary abayas, every garment is made to order by skilled
                                        artisans who pour their expertise and passion into their craft. We are committed to ethical
                                        production, fair compensation, and sustainable practices.
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2 className="font-serif text-4xl lg:text-6xl font-light mb-8 tracking-tight">
                                    Our Values
                                </h2>
                                <div className="space-y-8">
                                    {[
                                        {
                                            title: "Authenticity",
                                            description: "Every piece is sourced directly from verified ateliers and designers, ensuring genuine craftsmanship."
                                        },
                                        {
                                            title: "Quality",
                                            description: "We curate only the finest materials and techniques, from hand-woven silks to intricate embroidery."
                                        },
                                        {
                                            title: "Heritage",
                                            description: "Celebrating traditional techniques passed down through generations while supporting contemporary innovation."
                                        },
                                        {
                                            title: "Sustainability",
                                            description: "Made-to-order production minimizes waste. We partner with ateliers committed to ethical practices."
                                        }
                                    ].map((value, index) => (
                                        <div key={index} className="border-l-2 border-border pl-6">
                                            <h3 className="font-sans text-xs editorial-spacing uppercase mb-2 text-foreground">
                                                {value.title}
                                            </h3>
                                            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                                                {value.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* The Process Section */}
                <div className="py-24 lg:py-32 bg-secondary/5">
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-16"
                        >
                            <h2 className="font-serif text-4xl lg:text-6xl font-light mb-6 tracking-tight">
                                The Process
                            </h2>
                            <p className="font-sans text-sm text-muted-foreground max-w-2xl mx-auto">
                                From atelier to your wardrobe, every piece follows a journey of craftsmanship and care.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-4 gap-8 lg:gap-12">
                            {[
                                {
                                    number: "01",
                                    title: "Curation",
                                    description: "Our team travels across MENA to discover exceptional ateliers and designers."
                                },
                                {
                                    number: "02",
                                    title: "Selection",
                                    description: "Each piece is carefully vetted for quality, authenticity, and cultural significance."
                                },
                                {
                                    number: "03",
                                    title: "Creation",
                                    description: "Artisans handcraft your piece using traditional techniques, typically 2-4 weeks."
                                },
                                {
                                    number: "04",
                                    title: "Delivery",
                                    description: "Your garment is carefully packaged and shipped directly from the atelier to you."
                                }
                            ].map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="font-serif text-6xl text-foreground/10 mb-4">{step.number}</div>
                                    <h3 className="font-sans text-xs editorial-spacing uppercase mb-4 text-foreground">
                                        {step.title}
                                    </h3>
                                    <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                                        {step.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="py-24 lg:py-32 border-t border-border">
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="font-serif text-4xl lg:text-6xl font-light mb-6 tracking-tight">
                                Join Our Journey
                            </h2>
                            <p className="font-sans text-sm text-muted-foreground mb-8 max-w-xl mx-auto">
                                Whether you're a designer, artisan, or collector, we'd love to hear from you.
                            </p>
                            <a
                                href="/apply"
                                className="inline-block bg-foreground text-background px-12 py-4 font-sans text-xs editorial-spacing uppercase hover:bg-foreground/90 transition-colors"
                            >
                                Partner With Us
                            </a>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default About;
