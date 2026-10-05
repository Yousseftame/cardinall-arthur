import React, { useState } from 'react';
import { Outlet, NavLink as RouterNavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LogOut, LayoutDashboard, ShoppingBag, Tags, Image as ImageIcon, 
  CreditCard, MessageSquare, HelpCircle, Phone, 
  Home, Clock, Eye, Users, Heart, FileText,
  Search, ShieldCheck, ChevronsLeft, Menu, PanelLeft, Globe
} from 'lucide-react';

const SIDEBAR_EASE = "duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

// Simple class merger
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

type NavEntry = 
  | { type: 'heading'; label: string }
  | { type: 'divider' }
  | { type: 'link'; href: string; icon: React.ElementType; label: string };

const navEntries: NavEntry[] = [
  { type: 'heading', label: 'Store Management' },
  { type: 'link', href: '/admin/categories', icon: Tags, label: 'Categories' },
  { type: 'link', href: '/admin/products', icon: ShoppingBag, label: 'Products' },
  { type: 'link', href: '/admin/orders', icon: CreditCard, label: 'Orders' },
  { type: 'link', href: '/admin/checkout', icon: ShieldCheck, label: 'Checkout Settings' },
  { type: 'divider' },
  { type: 'heading', label: 'Home Page' },
  { type: 'link', href: '/admin/hero', icon: Home, label: 'Hero Section' },
  { type: 'link', href: '/admin/projects', icon: LayoutDashboard, label: 'Latest Projects' },
  { type: 'link', href: '/admin/partners', icon: Users, label: 'Trusted Partners' },
  { type: 'link', href: '/admin/banners', icon: ImageIcon, label: 'Banners' },
  { type: 'divider' },
  { type: 'heading', label: 'About Page' },
  { type: 'link', href: '/admin/about-intro', icon: FileText, label: 'About Us Intro' },
  { type: 'link', href: '/admin/timeline', icon: Clock, label: 'Timeline' },
  { type: 'link', href: '/admin/vision', icon: Eye, label: 'Vision' },
  { type: 'link', href: '/admin/socials', icon: Heart, label: 'On Socials' },
  { type: 'divider' },
  { type: 'heading', label: 'Customer Service' },
  { type: 'link', href: '/admin/feedback', icon: MessageSquare, label: 'Feedback' },
  { type: 'link', href: '/admin/cant-find', icon: Search, label: 'Can\'t Find It' },
  { type: 'link', href: '/admin/contact', icon: Phone, label: 'Contact Us' },
  { type: 'link', href: '/admin/faq', icon: HelpCircle, label: 'FAQ' },
  { type: 'link', href: '/admin/terms', icon: FileText, label: 'Terms & Conditions' },
];

export default function DashboardLayout() {
  const { logout, user } = useAuth();
  const initial = (user?.email?.[0] ?? "A").toUpperCase();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const onToggle = () => setCollapsed(!collapsed);
  const onMobileClose = () => setMobileOpen(false);

  return (
    <div className="flex h-screen bg-[#F4F4F4] text-gray-800 font-sans overflow-hidden">
      
      {/* Mobile Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[#2C0E11]/30 transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onMobileClose}
        aria-hidden
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex h-screen shrink-0 flex-col overflow-x-hidden overflow-y-auto scrollbar-hide bg-[#F4F4F4] py-6 transition-[width,transform,padding] lg:sticky lg:top-0",
          SIDEBAR_EASE,
          collapsed ? "lg:w-[76px] lg:px-3" : "lg:w-[320px] lg:px-5",
          "w-[320px] px-5",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Container */}
        <div
          className={cn(
            "mb-8 flex items-center shrink-0",
            collapsed ? "lg:h-11 lg:justify-center" : "h-12 px-3 justify-center"
          )}
        >
          <div
            onClick={() => { navigate('/admin'); onMobileClose(); }}
            className={cn(
              "relative flex shrink-0 items-center justify-center overflow-hidden transition-[width,height] cursor-pointer",
              SIDEBAR_EASE,
              collapsed ? "lg:h-11 lg:w-11" : "h-11 w-full"
            )}
          >
            {/* Cardinal Text */}
            <span
              className={cn(
                "grid min-w-0 transition-[grid-template-columns,opacity,margin]",
                SIDEBAR_EASE,
                collapsed ? "lg:grid-cols-[0fr] lg:opacity-0 lg:mr-0" : "grid-cols-[1fr] opacity-100 mr-2 md:mr-3"
              )}
            >
              <span className="overflow-hidden whitespace-nowrap font-heading text-base font-bold tracking-tighter uppercase text-[#2C0E11] mt-0.5">
                Cardinal
              </span>
            </span>

            {/* Logo Image */}
            <img 
              src="/logo-removebg-preview.png" 
              alt="Logo" 
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 shrink-0" 
            />

            {/* Arthur Text */}
            <span
              className={cn(
                "grid min-w-0 transition-[grid-template-columns,opacity,margin]",
                SIDEBAR_EASE,
                collapsed ? "lg:grid-cols-[0fr] lg:opacity-0 lg:ml-0" : "grid-cols-[1fr] opacity-100 ml-2 md:ml-3"
              )}
            >
              <span className="overflow-hidden whitespace-nowrap font-heading text-base font-bold tracking-tighter uppercase text-[#2C0E11] mt-0.5">
                Arthur
              </span>
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-1 flex-col gap-1">
          {navEntries.map((entry, index) => {
            if (entry.type === "divider") {
              return (
                <div
                  key={`divider-${index}`}
                  className="mx-3 my-3 h-px bg-[#2C0E11]/10 shrink-0"
                />
              );
            }

            if (entry.type === "heading") {
              return (
                <div
                  key={`heading-${index}`}
                  className={cn(
                    "grid min-w-0 transition-[grid-template-columns,opacity]",
                    SIDEBAR_EASE,
                    collapsed ? "lg:grid-cols-[0fr] lg:opacity-0" : "grid-cols-[1fr] opacity-100"
                  )}
                >
                  <div className="overflow-hidden whitespace-nowrap px-3 pb-1 pt-1">
                    <span className="text-[12px] font-semibold text-[#8c8c8c] tracking-[0.14em] uppercase">
                      {entry.label}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <NavLink
                key={entry.href}
                item={entry}
                collapsed={collapsed}
                active={location.pathname === entry.href}
                onClick={onMobileClose}
              />
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-4 flex flex-col gap-1 shrink-0">
          <button
            type="button"
            onClick={onToggle}
            className={cn(navItemClass({ collapsed }), "hidden lg:flex")}
          >
            <ChevronsLeft
              className={cn(
                "h-[20px] w-[20px] shrink-0 transition-transform",
                SIDEBAR_EASE,
                collapsed && "lg:rotate-180"
              )}
              strokeWidth={1.8}
            />
            <SidebarLabel collapsed={collapsed}>
              {collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            </SidebarLabel>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className={cn(navItemClass({ collapsed, danger: true }))}
          >
            <LogOut className="h-[20px] w-[20px] shrink-0" strokeWidth={1.8} />
            <SidebarLabel collapsed={collapsed}>Sign Out</SidebarLabel>
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="flex items-center gap-3 px-4 py-5 md:gap-4 md:px-8 z-10 shrink-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-gray-800 lg:hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <button
            type="button"
            onClick={onToggle}
            className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-gray-800 lg:flex shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:bg-gray-50 transition-colors"
          >
            <PanelLeft className="h-5 w-5" />
          </button>

          <div className="hidden sm:flex items-center gap-3">
            <h1 className="truncate text-lg font-bold tracking-tight text-gray-900">
              {(navEntries.find(e => 'href' in e && e.href === location.pathname) as Extract<NavEntry, { type: 'link' }>)?.label || "Dashboard"}
            </h1>
            <span className="inline-flex items-center rounded-full bg-[#2C0E11]/10 px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold text-[#2C0E11]">
              Admin Panel
            </span>
          </div>

          <label className="relative ml-auto hidden min-w-0 flex-1 max-w-xl md:block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search..."
              className="h-12 w-full rounded-full bg-white pr-4 pl-11 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus:ring-2 focus:ring-[#2C0E11]/20 transition-all border-none"
            />
          </label>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <a
              href="/"
              target="_blank"
              className="hidden h-12 items-center rounded-full bg-[#2C0E11] px-6 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#2C0E11]/90 sm:inline-flex shadow-sm"
            >
              View Store
            </a>
            <a
              href="/"
              target="_blank"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#2C0E11] text-white sm:hidden shadow-sm"
            >
              <Globe className="h-4 w-4" />
            </a>

            {/* Avatar Dropdown Placeholder */}
            <div className="h-12 w-12 rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center justify-center p-1 cursor-pointer hover:bg-gray-50 transition-colors">
               <div className="w-full h-full rounded-full bg-gradient-to-br from-[#2C0E11] to-red-900 text-white flex items-center justify-center font-bold text-sm">
                 {initial}
               </div>
            </div>
          </div>
        </header>

        {/* Page Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-8 relative scrollbar-hide">
          <div className="w-full relative z-10 h-full">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

function NavLink({
  item,
  collapsed,
  active,
  onClick,
}: {
  item: Extract<NavEntry, { type: 'link' }>;
  collapsed: boolean;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <RouterNavLink
      to={item.href}
      title={item.label}
      onClick={onClick}
      className={navItemClass({ collapsed, active })}
    >
      <span className="relative shrink-0 flex items-center justify-center">
        <Icon className="h-[20px] w-[20px]" strokeWidth={active ? 2.5 : 1.8} />
      </span>
      <SidebarLabel collapsed={collapsed}>
        {item.label}
      </SidebarLabel>
    </RouterNavLink>
  );
}

function navItemClass({
  collapsed,
  active = false,
  danger = false,
}: {
  collapsed: boolean;
  active?: boolean;
  danger?: boolean;
}) {
  return cn(
    "flex items-center text-[15px] font-medium transition-[width,height,background-color,color,box-shadow,gap,border-radius]",
    SIDEBAR_EASE,
    collapsed
      ? "gap-3 px-3 py-3 lg:mx-auto lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:rounded-2xl lg:px-0 lg:py-0"
      : "w-full gap-3 rounded-2xl px-3 py-3",
    danger
      ? "text-red-500 hover:bg-red-50 hover:text-red-600"
      : active
        ? "bg-white font-semibold text-[#2C0E11] shadow-[0_8px_24px_rgba(44,14,17,0.08)]"
        : "text-[#6B7280] hover:bg-white/70 hover:text-[#2C0E11]"
  );
}

function SidebarLabel({
  collapsed,
  children,
}: {
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "grid min-w-0 transition-[grid-template-columns,opacity]",
        SIDEBAR_EASE,
        collapsed ? "lg:grid-cols-[0fr] lg:opacity-0" : "grid-cols-[1fr] opacity-100"
      )}
    >
      <span className="overflow-hidden whitespace-nowrap">{children}</span>
    </span>
  );
}
