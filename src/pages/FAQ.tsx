import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            category: "Orders & Shipping",
            questions: [
                {
                    q: "How long does production take?",
                    a: "Most pieces are made to order and require 2-4 weeks for production. Each product page displays the specific production time. Rush orders may be available for an additional fee—please contact us for details."
                },
                {
                    q: "Do you ship internationally?",
                    a: "Yes, we ship worldwide. Standard international shipping takes 14-21 business days. Express shipping (7-10 days) is available for most destinations. Shipping is free on orders over $500."
                },
                {
                    q: "How can I track my order?",
                    a: "Once your order ships, you'll receive a tracking number via email. You can also track your order status by logging into your account and viewing your order history."
                },
                {
                    q: "What if my item is damaged during shipping?",
                    a: "We package all items with extreme care. If your item arrives damaged, please contact us within 48 hours with photos. We'll arrange a replacement or full refund immediately."
                }
            ]
        },
        {
            category: "Sizing & Fit",
            questions: [
                {
                    q: "How do I choose the right size?",
                    a: "Each product page includes detailed size charts. Most of our pieces are designed with a relaxed, flowing fit. If you're between sizes, we recommend sizing up. Custom sizing is available for most items—select 'Custom' and we'll contact you for measurements."
                },
                {
                    q: "Do you offer custom sizing?",
                    a: "Yes! Select 'Custom Size' during checkout, and our team will email you a measurement guide within 24 hours. Custom pieces typically add 1 week to production time but ensure a perfect fit."
                },
                {
                    q: "Can I request alterations?",
                    a: "Minor alterations (hem length, sleeve length) can be requested during the custom sizing process at no additional cost. Major alterations may incur fees—please contact us for a quote."
                }
            ]
        },
        {
            category: "Returns & Exchanges",
            questions: [
                {
                    q: "What is your return policy?",
                    a: "We accept returns within 14 days of delivery for unworn, unaltered items with original tags attached. Made-to-order and custom-sized items are final sale. Return shipping is the customer's responsibility unless the item is defective."
                },
                {
                    q: "How do I initiate a return?",
                    a: "Log into your account, go to Order History, and select 'Request Return' next to the eligible item. You'll receive return instructions and a prepaid label (for defective items only) within 24 hours."
                },
                {
                    q: "When will I receive my refund?",
                    a: "Refunds are processed within 5-7 business days of receiving your return. The refund will be credited to your original payment method. Please allow an additional 3-5 business days for the credit to appear in your account."
                },
                {
                    q: "Can I exchange an item?",
                    a: "We don't offer direct exchanges. Please return the original item for a refund and place a new order for the desired size or color. If you need assistance, our team is happy to help coordinate this process."
                }
            ]
        },
        {
            category: "Payment & Security",
            questions: [
                {
                    q: "What payment methods do you accept?",
                    a: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay. All transactions are processed through secure, encrypted payment gateways."
                },
                {
                    q: "Is my payment information secure?",
                    a: "Absolutely. We use industry-standard SSL encryption and never store your full credit card details. All payments are processed through PCI-compliant payment processors (PayPal/Stripe)."
                },
                {
                    q: "Do you offer payment plans?",
                    a: "Not currently, but we're exploring installment payment options. Sign up for our newsletter to be notified when this feature becomes available."
                }
            ]
        },
        {
            category: "Product Care",
            questions: [
                {
                    q: "How should I care for my garment?",
                    a: "Most pieces require dry cleaning only. Detailed care instructions are included with each item and on the product page. We recommend storing garments in a cool, dry place away from direct sunlight, preferably in a breathable garment bag."
                },
                {
                    q: "Can I hand wash my item?",
                    a: "Some pieces made from cotton or linen may be hand-washed in cold water with gentle detergent. Check the care label and product page for specific instructions. When in doubt, dry clean to preserve embellishments and fabric quality."
                },
                {
                    q: "How do I store embellished pieces?",
                    a: "Hang embellished pieces on padded hangers to prevent stretching. For heavily beaded items, store flat in acid-free tissue paper. Avoid plastic bags, which can trap moisture and cause damage."
                }
            ]
        },
        {
            category: "For Designers",
            questions: [
                {
                    q: "How can I sell on MENA ROYAL?",
                    a: "We're always looking for talented designers and ateliers. Visit our 'Apply' page to submit your brand for consideration. Our curation team reviews all applications within 2 weeks."
                },
                {
                    q: "What are the requirements to join?",
                    a: "We seek designers who demonstrate exceptional craftsmanship, authentic cultural heritage, and ethical production practices. You should be able to fulfill made-to-order production within 2-4 weeks and provide high-quality product photography."
                },
                {
                    q: "What commission does MENA ROYAL take?",
                    a: "Our commission structure varies based on product category and volume. Typically, we take 20-30% to cover platform fees, marketing, and customer service. Details are provided during the application process."
                }
            ]
        }
    ];

    return (
        <Layout>
            <div className="bg-background min-h-screen">
                {/* Hero */}
                <div className="pt-32 pb-16 border-b border-border">
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-6 uppercase tracking-[0.3em]">
                                Support
                            </p>
                            <h1 className="font-serif text-5xl lg:text-8xl font-light text-foreground tracking-tighter mb-8">
                                Frequently Asked Questions
                            </h1>
                            <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                Find answers to common questions about ordering, shipping, sizing, and more.
                                Can't find what you're looking for? <a href="mailto:support@menaroyal.com" className="underline hover:text-foreground transition-colors">Contact us</a>.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* FAQ Content */}
                <div className="py-24 lg:py-32">
                    <div className="max-w-4xl mx-auto px-6 lg:px-12">
                        {faqs.map((category, categoryIndex) => (
                            <motion.div
                                key={categoryIndex}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                                className="mb-16"
                            >
                                <h2 className="font-sans text-xs editorial-spacing uppercase mb-8 text-foreground border-b border-border pb-4">
                                    {category.category}
                                </h2>
                                <div className="space-y-4">
                                    {category.questions.map((faq, faqIndex) => {
                                        const globalIndex = categoryIndex * 100 + faqIndex;
                                        const isOpen = openIndex === globalIndex;

                                        return (
                                            <div
                                                key={faqIndex}
                                                className="border border-border hover:border-foreground/30 transition-colors"
                                            >
                                                <button
                                                    onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                                                    className="w-full px-6 py-5 flex items-center justify-between text-left group"
                                                >
                                                    <span className="font-sans text-sm text-foreground pr-8">
                                                        {faq.q}
                                                    </span>
                                                    <ChevronDown
                                                        className={`w-4 h-4 text-muted-foreground group-hover:text-foreground transition-all flex-shrink-0 ${isOpen ? "rotate-180" : ""
                                                            }`}
                                                    />
                                                </button>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="px-6 pb-5 border-t border-border"
                                                    >
                                                        <p className="font-sans text-sm text-muted-foreground leading-relaxed pt-5">
                                                            {faq.a}
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="py-24 lg:py-32 bg-secondary/5 border-t border-border">
                    <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="font-serif text-4xl lg:text-5xl font-light mb-6 tracking-tight">
                                Still Have Questions?
                            </h2>
                            <p className="font-sans text-sm text-muted-foreground mb-8">
                                Our team is here to help. Reach out anytime.
                            </p>
                            <a
                                href="mailto:support@menaroyal.com"
                                className="inline-block bg-foreground text-background px-12 py-4 font-sans text-xs editorial-spacing uppercase hover:bg-foreground/90 transition-colors"
                            >
                                Contact Support
                            </a>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FAQ;
