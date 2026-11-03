import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderTree, 
  Package, 
  ShoppingBag, 
  Palette, 
  Menu, 
  X, 
  ExternalLink 
} from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Dashboard', exact: true, icon: LayoutDashboard },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/theme', label: 'Theme & Colors', icon: Palette },
];

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f0f0ee]">
      {/* Mobile Top Bar */}
      <header className="md:hidden sticky top-0 z-30 bg-[#0d0d0d] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar"
            className="p-1.5 rounded-md hover:bg-white/10 active:scale-95 transition-all"
          >
            <Menu size={22} />
          </button>
          <div>
            <span className="font-display text-xl tracking-wider">XYVORA</span>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-[#d4ff3f] bg-white/10 px-1.5 py-0.5 rounded">
              Admin
            </span>
          </div>
        </div>

        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
        >
          <span>Store</span>
          <ExternalLink size={13} />
        </Link>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0d0d0d] text-white flex flex-col transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl tracking-wider">XYVORA</h1>
            <p className="text-[11px] uppercase tracking-widest text-[#d4ff3f]">Admin Dashboard</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="p-2 rounded-md hover:bg-white/10 active:scale-95 transition-all text-white/70 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#d4ff3f] text-[#0d0d0d] font-semibold shadow-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon size={18} strokeWidth={2} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-white/80 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span>View Live Store</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-[#0d0d0d] text-white flex-col shrink-0 min-h-screen sticky top-0 h-screen border-r border-black/10">
        <div className="px-6 py-6 border-b border-white/10">
          <h1 className="font-display text-2xl tracking-wider">XYVORA</h1>
          <p className="text-xs uppercase tracking-widest text-[#d4ff3f]">Admin panel</p>
        </div>

        <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#d4ff3f] text-[#0d0d0d] font-semibold shadow-sm'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon size={18} strokeWidth={2} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full py-2.5 px-3.5 rounded-lg text-xs font-semibold text-white/70 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span>Visit Storefront</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-10 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;