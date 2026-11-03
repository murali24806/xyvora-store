import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Package, FolderTree, ShoppingBag, Palette, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=1').catch(() => ({ data: { total: 0 } })),
      api.get('/categories').catch(() => ({ data: [] })),
      api.get('/orders').catch(() => ({ data: [] }))
    ]).then(([prodRes, catRes, ordRes]) => {
      setStats({
        products: prodRes.data?.total || 0,
        categories: catRes.data?.length || 0,
        orders: Array.isArray(ordRes.data) ? ordRes.data.length : 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-[#0d0d0d] mb-1">Dashboard</h1>
        <p className="text-gray-500 text-xs sm:text-sm">Welcome back. Here is a real-time overview of your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 sm:mb-10">
        <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-black/5 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Products</p>
            <p className="font-display text-3xl sm:text-4xl text-[#0d0d0d]">
              {loading ? '—' : stats.products}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center text-[#0d0d0d]">
            <Package size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-black/5 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Categories</p>
            <p className="font-display text-3xl sm:text-4xl text-[#0d0d0d]">
              {loading ? '—' : stats.categories}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center text-[#0d0d0d]">
            <FolderTree size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-black/5 flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Orders</p>
            <p className="font-display text-3xl sm:text-4xl text-[#0d0d0d]">
              {loading ? '—' : stats.orders}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#d4ff3f]/30 flex items-center justify-center text-[#0d0d0d]">
            <ShoppingBag size={24} />
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Quick Navigation</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          to="/admin/products" 
          className="group bg-[#0d0d0d] text-white rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]"
        >
          <div>
            <div className="flex items-center justify-between mb-3 text-white/70">
              <Package size={22} />
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="font-semibold text-base mb-1">Manage Products</p>
            <p className="text-xs text-white/60">Add items, set sizes, colors, prices & photos</p>
          </div>
        </Link>

        <Link 
          to="/admin/categories" 
          className="group bg-[#0d0d0d] text-white rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]"
        >
          <div>
            <div className="flex items-center justify-between mb-3 text-white/70">
              <FolderTree size={22} />
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="font-semibold text-base mb-1">Manage Categories</p>
            <p className="text-xs text-white/60">Organize items into collections</p>
          </div>
        </Link>

        <Link 
          to="/admin/orders" 
          className="group bg-[#0d0d0d] text-white rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]"
        >
          <div>
            <div className="flex items-center justify-between mb-3 text-white/70">
              <ShoppingBag size={22} />
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="font-semibold text-base mb-1">Customer Orders</p>
            <p className="text-xs text-white/60">Track shipments, statuses and export PDF</p>
          </div>
        </Link>

        <Link 
          to="/admin/theme" 
          className="group bg-[#d4ff3f] text-[#0d0d0d] rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]"
        >
          <div>
            <div className="flex items-center justify-between mb-3 text-black/70">
              <Palette size={22} />
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="font-semibold text-base mb-1">Theme & Colors</p>
            <p className="text-xs text-black/70">Customize site palette, hero and branding</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;