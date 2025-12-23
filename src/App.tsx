import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerOrders from "./pages/CustomerOrders";
import CustomerProfile from "./pages/CustomerProfile";
import Wishlist from "./pages/Wishlist";
import FarmerCorner from "./pages/FarmerCorner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-center" richColors />
            <BrowserRouter>
              <div className="mobile-bottom-spacing">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/categories" element={<Products />} />
                  <Route path="/orders" element={<CustomerOrders />} />
                  <Route path="/profile" element={<CustomerProfile />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/farmer-corner" element={<FarmerCorner />} />
                  <Route 
                    path="/seller/*" 
                    element={
                      <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <SellerDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/*" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <MobileBottomNav />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
