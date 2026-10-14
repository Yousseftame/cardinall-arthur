import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MasterLayout from "./layouts/MasterLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";
import HomePage from "./pages/storefront/HomePage";
import MarketplacePage from "./pages/storefront/MarketplacePage";
import ProductPage from "./pages/storefront/ProductPage";
import AboutPage from "./pages/storefront/AboutPage";
import CantFindItPage from "./pages/storefront/CantFindItPage";
import NotFoundPage from "./pages/storefront/NotFoundPage";
import CheckoutPage from "./pages/storefront/CheckoutPage";
import FavoritesPage from "./pages/storefront/FavoritesPage";
import FAQPage from "./pages/storefront/FAQPage";
import TermsPage from "./pages/storefront/TermsPage";

import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Admin pages: lazy-loaded so unused routes never download or fetch data
const CategoriesPage = lazy(() => import("./pages/admin/CategoriesPage"));
const ProductsPage = lazy(() => import("./pages/admin/ProductsPage"));
const OrdersPage = lazy(() => import("./pages/admin/OrdersPage"));
const CheckoutSettingsPage = lazy(() => import("./pages/admin/CheckoutSettingsPage"));
const FeedbackPage = lazy(() => import("./pages/admin/FeedbackPage"));
const ContactMessagesPage = lazy(() => import("./pages/admin/ContactMessagesPage"));
const CantFindRequestsPage = lazy(() => import("./pages/admin/CantFindRequestsPage"));
const PaidCustomersPage = lazy(() => import("./pages/admin/PaidCustomersPage"));
const NewsletterPage = lazy(() => import("./pages/admin/NewsletterPage"));
const FaqPage = lazy(() => import("./pages/admin/FaqPage"));
const TermsAdminPage = lazy(() => import("./pages/admin/TermsPage"));
const DashboardHomePage = lazy(() => import("./pages/admin/DashboardHomePage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

function AdminPageFallback() {
  return (
    <div className="flex items-center justify-center py-24 text-sm text-gray-500 font-medium tracking-wide">
      Loading...
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(10, 10, 10, 0.85)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              borderRadius: '100px',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '14px 24px',
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '0.03em',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.7)',
            },
            success: {
              iconTheme: {
                primary: '#c7ea46',
                secondary: '#0a0a0a',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff4b4b',
                secondary: '#fff',
              },
            },
          }}
        />
        <BrowserRouter>
          <Routes>
            {/* 1. Storefront Layout (Master) */}
            <Route path="/" element={<MasterLayout />}>
              <Route index element={<HomePage />} />
              <Route path="marketplace" element={<MarketplacePage />} />
              <Route path="product/:id" element={<ProductPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="cant-find-it" element={<CantFindItPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="faq" element={<FAQPage />} />
              <Route path="terms" element={<TermsPage />} />
            </Route>

            {/* 2. Admin Dashboard Layout (Protected) */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<Suspense fallback={<AdminPageFallback />}><DashboardHomePage /></Suspense>} />
                
                <Route path="categories" element={<Suspense fallback={<AdminPageFallback />}><CategoriesPage /></Suspense>} />
                <Route path="products" element={<Suspense fallback={<AdminPageFallback />}><ProductsPage /></Suspense>} />
                <Route path="orders" element={<Suspense fallback={<AdminPageFallback />}><OrdersPage /></Suspense>} />
                <Route path="customers" element={<Suspense fallback={<AdminPageFallback />}><PaidCustomersPage /></Suspense>} />
                <Route path="newsletter" element={<Suspense fallback={<AdminPageFallback />}><NewsletterPage /></Suspense>} />
                <Route path="checkout" element={<Suspense fallback={<AdminPageFallback />}><CheckoutSettingsPage /></Suspense>} />
                
                <Route path="hero" element={<div className="text-white text-xl font-light tracking-widest uppercase">Hero Section Editor</div>} />
                <Route path="projects" element={<div className="text-white text-xl font-light tracking-widest uppercase">Latest Projects Editor</div>} />
                <Route path="partners" element={<div className="text-white text-xl font-light tracking-widest uppercase">Trusted Partners Editor</div>} />
                <Route path="banners" element={<div className="text-white text-xl font-light tracking-widest uppercase">Banners Management</div>} />
                
                <Route path="about-intro" element={<div className="text-white text-xl font-light tracking-widest uppercase">About Us Section Editor</div>} />
                <Route path="timeline" element={<div className="text-white text-xl font-light tracking-widest uppercase">Timeline Section Editor</div>} />
                <Route path="vision" element={<div className="text-white text-xl font-light tracking-widest uppercase">Vision Section Editor</div>} />
                <Route path="socials" element={<div className="text-white text-xl font-light tracking-widest uppercase">On Socials Editor</div>} />
                
                <Route path="feedback" element={<Suspense fallback={<AdminPageFallback />}><FeedbackPage /></Suspense>} />
                <Route path="cant-find" element={<Suspense fallback={<AdminPageFallback />}><CantFindRequestsPage /></Suspense>} />
                <Route path="contact" element={<Suspense fallback={<AdminPageFallback />}><ContactMessagesPage /></Suspense>} />
                <Route path="faq" element={<Suspense fallback={<AdminPageFallback />}><FaqPage /></Suspense>} />
                <Route path="terms" element={<Suspense fallback={<AdminPageFallback />}><TermsAdminPage /></Suspense>} />
              </Route>
            </Route>

            {/* 3. Auth Layout */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="register" element={<div>Register Page</div>} />
            </Route>

            {/* 4. Catch-all 404 Route (No Layout) */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
