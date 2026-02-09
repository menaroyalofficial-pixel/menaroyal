import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useStore } from "@/contexts/StoreContext";
import { formatPrice } from "@/data/mockData";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, clearCart } = useStore();

  return (
    <Layout>
      <Layout>
        <div className="bg-background min-h-screen pt-32 pb-32">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-24">
              <p className="font-sans text-[10px] editorial-spacing text-muted-foreground mb-6 uppercase tracking-[0.3em]">
                The Archive
              </p>
              <h1 className="font-serif text-5xl lg:text-7xl font-light text-foreground tracking-tighter">
                Shopping <span className="italic">Bag</span>
              </h1>
              <p className="font-sans text-[10px] text-muted-foreground mt-8 editorial-spacing">
                {cart.length} {cart.length === 1 ? "POSITION" : "POSITIONS"} SELECTED
              </p>
            </div>

            {cart.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
                {/* Cart Items */}
                <div className="lg:col-span-8">
                  <div className="space-y-12">
                    <div className="hidden lg:grid grid-cols-12 pb-6 border-b border-border">
                      <div className="col-span-6 font-sans text-[10px] editorial-spacing text-muted-foreground">Product Details</div>
                      <div className="col-span-3 font-sans text-[10px] editorial-spacing text-muted-foreground text-center">Quantity</div>
                      <div className="col-span-3 font-sans text-[10px] editorial-spacing text-muted-foreground text-right">Total</div>
                    </div>

                    {cart.map((item, index) => (
                      <motion.div
                        key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-12 border-b border-border group"
                      >
                        {/* Product Info */}
                        <div className="lg:col-span-6 flex gap-8 items-center">
                          <Link to={`/product/${item.product.slug}`} className="relative aspect-[3/4] w-24 lg:w-32 bg-secondary/20 overflow-hidden block">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          </Link>
                          <div className="space-y-2">
                            <p className="font-sans text-[9px] editorial-spacing text-muted-foreground">
                              {item.product.brandName}
                            </p>
                            <Link to={`/product/${item.product.slug}`}>
                              <h3 className="font-serif text-xl lg:text-2xl font-light text-foreground group-hover:italic transition-all">
                                {item.product.name}
                              </h3>
                            </Link>
                            <div className="flex gap-4 font-sans text-[10px] editorial-spacing text-muted-foreground/60 pt-2">
                              {item.selectedSize && <span>SIZE: {item.selectedSize}</span>}
                              {item.selectedColor && <span>COLOR: {item.selectedColor}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="lg:col-span-3 flex justify-center">
                          <div className="flex items-center gap-6 border border-border px-4 py-2">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-sans text-xs font-medium min-w-[1rem] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Price & Remove */}
                        <div className="lg:col-span-3 flex flex-col items-end gap-2">
                          <p className="font-sans text-sm font-medium text-foreground">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="font-sans text-[9px] editorial-spacing text-muted-foreground hover:text-foreground border-b border-transparent hover:border-foreground transition-all pt-2"
                          >
                            REMOVE
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-4">
                  <div className="border border-border p-10 space-y-10 sticky top-32">
                    <h2 className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase">
                      Checkout Summary
                    </h2>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center bg-secondary/10 p-4">
                        <span className="font-sans text-[10px] editorial-spacing text-muted-foreground">SUBTOTAL</span>
                        <span className="font-sans text-sm font-medium">{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4">
                        <span className="font-sans text-[10px] editorial-spacing text-muted-foreground">SHIPPING</span>
                        <span className="font-sans text-[10px] editorial-spacing text-foreground font-bold">COMPLIMENTARY</span>
                      </div>
                      <div className="border-t border-border pt-8 flex justify-between items-end px-4">
                        <div className="space-y-1">
                          <span className="font-sans text-[10px] editorial-spacing text-muted-foreground">ESTIMATED TOTAL</span>
                          <p className="font-sans text-[8px] text-muted-foreground/40 italic">Global delivery included</p>
                        </div>
                        <span className="font-serif text-3xl font-light">{formatPrice(cartTotal)}</span>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <Link
                        to="/checkout"
                        className="w-full text-center group relative font-sans text-[10px] editorial-spacing py-6 overflow-hidden block"
                      >
                        <span className="relative z-10 text-white group-hover:text-black transition-colors duration-500">Initialize Checkout</span>
                        <div className="absolute inset-0 bg-black scale-x-100 group-hover:scale-x-0 transition-transform duration-500 origin-right" />
                        <div className="absolute inset-0 border border-black" />
                      </Link>
                      <Link
                        to="/shop"
                        className="block text-center font-sans text-[9px] editorial-spacing text-muted-foreground hover:text-foreground transition-colors py-2"
                      >
                        RETURN TO COLLECTION
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-40 bg-secondary/5 border border-dashed border-border"
              >
                <ShoppingBag className="w-12 h-12 text-muted-foreground/20 mx-auto mb-8 stroke-[1px]" />
                <h2 className="font-serif text-3xl font-light text-foreground mb-4 italic">Empty Archive</h2>
                <p className="font-sans text-xs text-muted-foreground mb-12 max-w-xs mx-auto leading-relaxed editorial-spacing font-light">
                  Your selection is currently empty. Discover heritage and contemporary craft in our collection.
                </p>
                <Link
                  to="/shop"
                  className="group relative font-sans text-[10px] editorial-spacing px-12 py-5 overflow-hidden inline-block"
                >
                  <span className="relative z-10 text-white group-hover:text-black transition-colors duration-500">Explore Collection</span>
                  <div className="absolute inset-0 bg-black scale-x-100 group-hover:scale-x-0 transition-transform duration-500 origin-right" />
                  <div className="absolute inset-0 border border-black" />
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </Layout>
    </Layout>
  );
};

export default Cart;
