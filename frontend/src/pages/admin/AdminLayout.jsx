import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Dashboard', exact: true },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/theme', label: 'Theme & Colors' },
];

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex bg-[#f0f0ee]">
      <aside className="w-60 bg-[#0d0d0d] text-white flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-white/10">
          <h1 className="font-display text-2xl">XYVORA</h1>
          <p className="text-xs uppercase tracking-widest text-white/40">Admin panel</p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `px-4 py-3 rounded-sm text-sm font-medium transition-colors ${isActive ? 'bg-[#d4ff3f] text-[#0d0d0d]' : 'text-white/80 hover:bg-white/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;