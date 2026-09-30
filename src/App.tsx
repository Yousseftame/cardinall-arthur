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

import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Initialize QueryClient
const queryClient = new QueryClient();

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
              fontFamily: '"Outfit", sans-serif',
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
                primary: '#c7ea46', // Matching the lime green cart badge
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
            </Route>

            {/* 2. Admin Dashboard Layout (Protected) */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<div className="text-white text-2xl font-medium tracking-widest uppercase">Admin Dashboard Home</div>} />
                <Route path="products" element={<div className="text-white text-2xl font-medium tracking-widest uppercase">Admin Products Management</div>} />
                <Route path="orders" element={<div className="text-white text-2xl font-medium tracking-widest uppercase">Admin Orders Management</div>} />
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
