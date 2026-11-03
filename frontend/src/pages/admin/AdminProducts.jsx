import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Package, Plus, Edit2, Trash2, X, Search, Image as ImageIcon } from 'lucide-react';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  discountPrice: '',
  category: '',
  sizes: 'S, M, L, XL',
  colors: '',
  stock: 100,
  inStock: true,
  featured: false,
  images: [],
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const fetchAll = () => {
    setLoading(true);
    Promise.all([api.get('/products?limit=100'), api.get('/categories')])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data.products || []);
        setCategories(catRes.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      discountPrice: p.discountPrice || '',
      category: p.category?._id || '',
      sizes: (p.sizes || []).join(', '),
      colors: (p.colors || []).join(', '),
      stock: p.stock,
      inStock: p.inStock !== false,
      featured: p.featured || false,
      images: [],
    });
    setEditingId(p._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchAll();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (form.discountPrice && Number(form.discountPrice) >= Number(form.price)) {
      setError('Discounted Selling Price must be less than the Original Price.');
      setSaving(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      if (form.discountPrice) fd.append('discountPrice', form.discountPrice);
      fd.append('category', form.category);
      fd.append(
        'sizes',
        JSON.stringify(
          form.sizes
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        )
      );
      fd.append(
        'colors',
        JSON.stringify(
          form.colors
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean)
        )
      );
      fd.append('stock', form.stock);
      fd.append('inStock', form.inStock);
      fd.append('featured', form.featured);
      Array.from(form.images).forEach((file) => fd.append('images', file));

      if (editingId) {
        await api.put(`/products/${editingId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/products', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      resetForm();
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchName = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory ? p.category?._id === filterCategory : true;
    return matchName && matchCat;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-[#0d0d0d] mb-1">Products</h1>
        <p className="text-gray-500 text-xs sm:text-sm">Add items, set prices, sizes, stock levels, and upload gallery photos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Product Creation / Edit Form */}
        <div className="lg:col-span-1">
          <form 
            onSubmit={handleSubmit} 
            className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-black/5 lg:sticky lg:top-6"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="font-semibold text-base text-[#0d0d0d]">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-gray-400 hover:text-black flex items-center gap-1"
                >
                  <X size={14} />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-medium mb-4">
                {error}
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oversized Heavyweight Tee"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Fabric details, fit, and model specs..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                    Regular Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="799"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                    Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional"
                    value={form.discountPrice}
                    onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Category *
                </label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                    Sizes
                  </label>
                  <input
                    type="text"
                    value={form.sizes}
                    onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                    placeholder="S, M, L, XL"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Colors (comma separated)
                </label>
                <input
                  type="text"
                  value={form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
                  placeholder="Black, White, Washed Grey"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center gap-5 py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                    className="rounded text-black focus:ring-black w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-700">In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="rounded text-black focus:ring-black w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-700">Feature on Homepage</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Photos (Up to 5{editingId ? ' — replaces old images' : ''})
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setForm({ ...form, images: e.target.files })}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-black/5 hover:file:bg-black/10 file:cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 px-4 bg-[#0d0d0d] text-white text-sm font-semibold rounded-lg hover:bg-black/80 active:scale-98 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Product List */}
        <div className="lg:col-span-2">
          {/* Search & Category Filter Bar */}
          <div className="bg-white rounded-xl p-3.5 sm:p-4 mb-4 shadow-sm border border-black/5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3.5 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-black bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-black/5">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-black/5">
              <Package size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="font-semibold text-gray-700">No products found</p>
              <p className="text-gray-400 text-xs mt-1">
                {products.length === 0 ? 'Create your first product using the form.' : 'Try adjusting your search or category filter.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-black/5 divide-y divide-gray-100 overflow-hidden">
              <div className="px-5 py-4 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Products ({filteredProducts.length})
                </span>
              </div>

              {filteredProducts.map((p) => {
                const primaryImage = p.images?.[0];
                return (
                  <div
                    key={p._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="w-14 h-16 sm:w-16 sm:h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-black/5">
                        {primaryImage ? (
                          <img src={primaryImage} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-[#0d0d0d] truncate">{p.name}</p>
                          {p.featured && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#d4ff3f] text-[#0d0d0d] px-1.5 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                          {!p.inStock && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-400 mt-0.5">
                          {p.category?.name || 'Uncategorized'} · Stock: {p.stock ?? 'N/A'}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5">
                          {p.discountPrice && p.discountPrice < p.price ? (
                            <>
                              <span className="font-bold text-sm text-[#0d0d0d]">₹{p.discountPrice}</span>
                              <span className="text-xs text-gray-400 line-through">₹{p.price}</span>
                            </>
                          ) : (
                            <span className="font-bold text-sm text-[#0d0d0d]">₹{p.price}</span>
                          )}
                          {p.sizes?.length > 0 && (
                            <span className="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              {p.sizes.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleEdit(p)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all text-gray-700"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-red-200 text-red-600 hover:bg-red-50 active:scale-95 transition-all"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;