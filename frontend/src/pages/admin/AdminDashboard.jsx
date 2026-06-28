import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, categories: 0 });

  useEffect(() => {
    Promise.all([api.get('/products?limit=1'), api.get('/categories')]).then(([prodRes, catRes]) => {
      setStats({ products: prodRes.data.total, categories: catRes.data.length });
    });
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Welcome back. Here's a quick overview.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-md p-6 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Products</p>
          <p className="font-display text-4xl">{stats.products}</p>
        </div>
        <div className="bg-white rounded-md p-6 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Categories</p>
          <p className="font-display text-4xl">{stats.categories}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/categories" className="bg-[#0d0d0d] text-white rounded-md p-6 hover:opacity-90">
          <p className="font-semibold mb-1">Manage Categories</p>
          <p className="text-sm text-white/60">Add, edit, or remove product categories</p>
        </Link>
        <Link to="/admin/products" className="bg-[#0d0d0d] text-white rounded-md p-6 hover:opacity-90">
          <p className="font-semibold mb-1">Manage Products</p>
          <p className="text-sm text-white/60">Add new items, update stock, pricing & images</p>
        </Link>
        <Link to="/admin/theme" className="bg-[#d4ff3f] text-[#0d0d0d] rounded-md p-6 hover:opacity-90">
          <p className="font-semibold mb-1">Theme & Colors</p>
          <p className="text-sm text-black/60">Change your storefront's live color scheme</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
