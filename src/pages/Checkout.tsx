import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useStore } from "@/contexts/StoreContext";
import { formatPrice } from "@/data/mockData";
import { motion } from "framer-motion";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Globe, Truck } from "lucide-react";

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useStore();
    const navigate = useNavigate();
    const [{ isPending }] = usePayPalScriptReducer();
    const [isProcessing, setIsProcessing] = useState(false);

    if (cart.length === 0 && !isProcessing) {
        navigate("/cart");
        return null;
    }

    const handlePaymentSuccess = (details: any) => {
        setIsProcessing(true);
        toast.success("Transaction Excellence: Your order has been archived and secured.");
        console.log("Payment Details:", details);

        // In a real app, you would save the order to Supabase here
        setTimeout(() => {
            clearCart();
            navigate("/account"); // Redirect to orders/account
        }, 2000);
    };

    return (
        <Layout>
            <div className="bg-background min-h-screen pt-32 pb-32">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

                        {/* Left Column: Information & Payment */}
                        <div className="lg:col-span-7 space-y-16">
                            <section>
                                <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-6 uppercase tracking-[0.3em]">Institutional Secure Checkout</p>
                                <h1 className="font-serif text-4xl lg:text-6xl font-light text-foreground tracking-tighter">
                                    Acquisition <span className="italic">Gateway</span>
                                </h1>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-border">
                                <div className="space-y-4">
                                    <ShieldCheck className="w-5 h-5 text-muted-foreground opacity-50" />
                                    <h3 className="font-sans text-[10px] editorial-spacing font-bold uppercase">Escrow Security</h3>
                                    <p className="font-sans text-[9px] text-muted-foreground leading-relaxed">Protected by MENA ROYAL institutional encrypted protocols.</p>
                                </div>
                                <div className="space-y-4">
                                    <Globe className="w-5 h-5 text-muted-foreground opacity-50" />
                                    <h3 className="font-sans text-[10px] editorial-spacing font-bold uppercase">Global Provenance</h3>
                                    <p className="font-sans text-[9px] text-muted-foreground leading-relaxed">Worldwide archival shipping with diplomatic priority handling.</p>
                                </div>
                                <div className="space-y-4">
                                    <Truck className="w-5 h-5 text-muted-foreground opacity-50" />
                                    <h3 className="font-sans text-[10px] editorial-spacing font-bold uppercase">Atelier Direct</h3>
                                    <p className="font-sans text-[9px] text-muted-foreground leading-relaxed">Direct dispatch from the artisan's house to your sanctuary.</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <h2 className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase opacity-40">Payment Fulfillment</h2>

                                <div className="bg-secondary/5 border border-border p-12 relative overflow-hidden">
                                    {isPending && (
                                        <div className="flex flex-col items-center justify-center py-12 space-y-6">
                                            <Loader2 className="w-8 h-8 animate-spin text-foreground opacity-20" />
                                            <p className="font-sans text-[10px] editorial-spacing uppercase opacity-40">Authorizing Secure Payment Interface...</p>
                                        </div>
                                    )}

                                    <div className={isPending ? "opacity-0 invisible pointer-events-none" : "opacity-100 visible transition-opacity duration-1000"}>
                                        <PayPalButtons
                                            style={{
                                                layout: "vertical",
                                                color: "black",
                                                shape: "rect",
                                                label: "pay"
                                            }}
                                            createOrder={(_data, actions) => {
                                                return actions.order.create({
                                                    intent: "CAPTURE",
                                                    purchase_units: [
                                                        {
                                                            amount: {
                                                                currency_code: "USD",
                                                                value: cartTotal.toString(),
                                                            },
                                                            description: "MENA ROYAL Archival Collection Acquisition",
                                                        },
                                                    ],
                                                });
                                            }}
                                            onApprove={async (_data, actions) => {
                                                const details = await actions.order?.capture();
                                                handlePaymentSuccess(details);
                                            }}
                                            onError={(err) => {
                                                console.error("PayPal Error:", err);
                                                toast.error("Institutional Gateway Error: Please verify your credentials.");
                                            }}
                                        />
                                    </div>

                                    {isProcessing && (
                                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-6">
                                            <Loader2 className="w-8 h-8 animate-spin text-foreground" />
                                            <p className="font-serif text-xl italic text-foreground uppercase tracking-widest">Validating Archive Deposit...</p>
                                        </div>
                                    )}
                                </div>

                                <p className="font-sans text-[8px] text-muted-foreground text-center uppercase editorial-spacing opacity-50">
                                    By confirming this acquisition, you agree to the MENA ROYAL Institutional Terms of Service and Archival Privacy Protocols.
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Order Review */}
                        <div className="lg:col-span-5">
                            <div className="bg-secondary/5 border border-border p-10 space-y-12 sticky top-32">
                                <h2 className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase">Archive Curation Review</h2>

                                <div className="space-y-8 max-h-[40vh] overflow-y-auto pr-4 scrollbar-thin">
                                    {cart.map((item) => (
                                        <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-6">
                                            <div className="w-16 aspect-[3/4] bg-white overflow-hidden flex-shrink-0 border border-border">
                                                <img src={item.product.images[0]} alt="" className="w-full h-full object-cover grayscale" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <h3 className="font-serif text-sm uppercase tracking-tight line-clamp-1">{item.product.name}</h3>
                                                <p className="font-sans text-[8px] text-muted-foreground uppercase tracking-widest">{item.product.brandName} <span className="mx-2">/</span> QTY: {item.quantity}</p>
                                                <p className="font-sans text-[9px] font-bold text-foreground pt-1">{formatPrice(item.product.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-border pt-10 space-y-6">
                                    <div className="flex justify-between items-center bg-white/50 p-4 border border-border">
                                        <span className="font-sans text-[10px] editorial-spacing text-muted-foreground">SUBTOTAL</span>
                                        <span className="font-sans text-sm font-medium">{formatPrice(cartTotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-4">
                                        <span className="font-sans text-[10px] editorial-spacing text-muted-foreground">SHIPPING</span>
                                        <span className="font-sans text-[9px] font-bold text-foreground">COMPLIMENTARY</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-6 border-t border-border px-4">
                                        <div className="space-y-1">
                                            <span className="font-sans text-[10px] editorial-spacing text-muted-foreground">TOTAL EVALUATION</span>
                                            <p className="font-sans text-[7px] text-muted-foreground/40 italic uppercase">Global Institutional Value</p>
                                        </div>
                                        <span className="font-serif text-4xl font-light">{formatPrice(cartTotal)}</span>
                                    </div>
                                </div>

                                <Link to="/cart" className="block text-center font-sans text-[9px] editorial-spacing text-muted-foreground hover:text-foreground border-t border-border pt-8 transition-colors">
                                    REVISE COLLECTION SELECTION
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Checkout;
