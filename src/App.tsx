import { useState, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompareProvider } from "@/contexts/CompareContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import CompareBar from "@/components/compare/CompareBar";
import SplashScreen from "@/components/layout/SplashScreen";

// Eagerly load critical pages
import Index from "./pages/Index";
import Products from "./pages/Products";
import Auth from "./pages/Auth";

// Lazy load less critical pages
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const SellerStore = lazy(() => import("./pages/SellerStore"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const SellerHome = lazy(() => import("./pages/SellerHome"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ManageOrders = lazy(() => import("./pages/admin/ManageOrders"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const SellerOrderReport = lazy(() => import("./pages/admin/SellerOrderReport"));
const CustomerOrders = lazy(() => import("./pages/CustomerOrders"));
const CustomerProfile = lazy(() => import("./pages/CustomerProfile"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const FarmerCorner = lazy(() => import("./pages/FarmerCorner"));
const FarmerForum = lazy(() => import("./pages/FarmerForum"));
const Compare = lazy(() => import("./pages/Compare"));
const Sellers = lazy(() => import("./pages/Sellers"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    },
  },
});

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash on first visit per session
    const hasSeenSplash = sessionStorage.getItem('khetify_splash_shown');
    return !hasSeenSplash;
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('khetify_splash_shown', 'true');
    setShowSplash(false);
  };

  return (
  <QueryClientProvider client={queryClient}>
    {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <CompareProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner position="top-center" richColors />
              <BrowserRouter>
                <div className="mobile-bottom-spacing">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/store/:sellerId" element={<SellerStore />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/login" element={<Auth />} />
                      <Route path="/categories" element={<Products />} />
                      <Route path="/orders" element={<CustomerOrders />} />
                      <Route path="/profile" element={<CustomerProfile />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/compare" element={<Compare />} />
                      <Route path="/sellers" element={<Sellers />} />
                      <Route path="/farmer-corner" element={<FarmerCorner />} />
                      <Route path="/forum" element={<FarmerForum />} />
                      <Route 
                        path="/seller-home" 
                        element={
                          <ProtectedRoute allowedRoles={['seller']}>
                            <SellerHome />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/seller/*" 
                        element={
                          <ProtectedRoute allowedRoles={['seller', 'admin']}>
                            <SellerDashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin" 
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/orders" 
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <ManageOrders />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/users" 
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <ManageUsers />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/seller-report/:sellerId" 
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <SellerOrderReport />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <CompareBar />
                  <MobileBottomNav />
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </CompareProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
  );
};

export default App;
