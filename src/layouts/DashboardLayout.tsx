import { Outlet, Link } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-6 flex flex-col">
        <h2 className="text-2xl font-heading mb-8">Admin Panel</h2>
        <nav className="flex flex-col gap-4">
          <Link to="/admin" className="hover:text-primary transition">Dashboard</Link>
          <Link to="/admin/products" className="hover:text-primary transition">Products</Link>
          <Link to="/admin/orders" className="hover:text-primary transition">Orders</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-muted/20">
        <Outlet />
      </main>
    </div>
  );
}
