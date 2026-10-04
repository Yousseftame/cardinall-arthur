import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function DashboardLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111] border-r border-white/10 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl uppercase mb-12 font-heading font-light tracking-tighter" >
            Admin Panel
          </h2>
          <nav className="flex flex-col gap-2">
            <Link to="/admin" className="px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-sm text-white/70 hover:text-white" >Dashboard</Link>
            <Link to="/admin/products" className="px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-sm text-white/70 hover:text-white" >Products</Link>
            <Link to="/admin/orders" className="px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-sm text-white/70 hover:text-white" >Orders</Link>
          </nav>
        </div>

        {/* Bottom Section: User Info & Logout */}
        <div>
          <div className="mb-4 px-4 text-center">
            <p className="text-xs text-white/40 truncate font-light" >
              {user?.email}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-[0.98] transition-all text-sm font-bold uppercase tracking-wider"
            
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 p-12 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
