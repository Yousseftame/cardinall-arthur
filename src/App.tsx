import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MasterLayout from "./layouts/MasterLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";
import HomePage from "./pages/storefront/HomePage";

// Initialize QueryClient
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* 1. Storefront Layout (Master) */}
          <Route path="/" element={<MasterLayout />}>
            <Route index element={<HomePage />} />
            {/* Add more routes like /products, /cart, /checkout here */}
          </Route>

          {/* 2. Admin Dashboard Layout */}
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<div>Admin Dashboard Home</div>} />
            <Route path="products" element={<div>Admin Products Management</div>} />
            <Route path="orders" element={<div>Admin Orders Management</div>} />
          </Route>

          {/* 3. Auth Layout */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<div>Login Page</div>} />
            <Route path="register" element={<div>Register Page</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
