import React, { memo } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import FeaturedProductsSection from '@/components/home/FeaturedProductsSection';
import CustomerDashboard from '@/components/dashboard/CustomerDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { useAuth } from '@/contexts/AuthContext';

const Index: React.FC = memo(() => {
  const { user, role, profile } = useAuth();

  // Redirect sellers to their dedicated home page
  if (user && role === 'seller') {
    return <Navigate to="/seller-home" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Role-based Dashboard Section */}
      {user && role === 'admin' && <AdminDashboard />}
      {user && role === 'customer' && <CustomerDashboard profile={profile} />}
      
      {/* Hero Section */}
      <HeroSection />

      {/* Features */}
      <FeaturesSection />

      {/* Categories */}
      <CategoriesSection />

      {/* Featured Products */}
      <FeaturedProductsSection />

      <Footer />
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
