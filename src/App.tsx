import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "@/contexts/StoreContext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import BrandPage from "./pages/BrandPage";
import Designers from "./pages/Designers";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Account from "./pages/Account";
import Stories from "./pages/Stories";
import StoryDetail from "./pages/StoryDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import DesignerLogin from "./pages/DesignerLogin";
import DesignerDashboard from "./pages/DesignerDashboard";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Shipping from "./pages/Shipping";
import Apply from "./pages/Apply";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/layout/ScrollToTop";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <StoreProvider>
        <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:category" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/brand/:slug" element={<BrandPage />} />
              <Route path="/designers" element={<Designers />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/account" element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              } />
              <Route path="/stories" element={<Stories />} />
              <Route path="/stories/:id" element={<StoryDetail />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/onboarding/:slug" element={<Onboarding />} />
              <Route path="/login" element={<Login />} />
              <Route path="/designer/login" element={<DesignerLogin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/dashboard/designer" element={
                <ProtectedRoute fallback="/designer/login">
                  <DesignerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/designer" element={
                <ProtectedRoute fallback="/designer/login">
                  <DesignerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute fallback="/admin/login">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/apply" element={<Apply />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PayPalScriptProvider>
      </StoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
