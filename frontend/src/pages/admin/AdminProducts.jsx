import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

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

  const fetchAll = () => {
    setLoading(true);
    Promise.all([api.get('/products?limit=100'), api.get('/categories')])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data.products);
        setCategories(catRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
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
      inStock: p.inStock !== false, // default true if undefined
      featured: p.featured,
      images: [],
    });
    setEditingId(p._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    await api.delete(`/products/${id}`);
    fetchAll();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
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

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Products</h1>
      <p className="text-gray-500 text-sm mb-8">Add new items, set pricing, sizes, colors, and photos.</p>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-md p-6 shadow-sm sticky top-6">
            <h2 className="font-semibold mb-4">{editingId ? 'Edit product' : 'Add new product'}</h2>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <label className="block mb-3">
              <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Name</span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm"
              />
            </label>

            <label className="block mb-3">
              <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm"
              />
            </label>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <label className="block">
                <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Price (₹)</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm"
                />
              </label>
              <label className="block">
                <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Sale price</span>
                <input
                  type="number"
                  min="0"
                  value={form.discountPrice}
                  onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm"
                />
              </label>
            </div>

            <label className="block mb-3">
              <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Category</span>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block mb-3">
              <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">
                Sizes (comma separated)
              </span>
              <input
                type="text"
                value={form.sizes}
                onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                placeholder="S, M, L, XL"
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm"
              />
            </label>

            <label className="block mb-3">
              <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">
                Colors (comma separated)
              </span>
              <input
                type="text"
                value={form.colors}
                onChange={(e) => setForm({ ...form, colors: e.target.value })}
                placeholder="Black, White, Olive"
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm"
              />
            </label>

            <label className="block mb-3">
              <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Stock</span>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm"
              />
            </label>

            <div className="flex items-center gap-6 mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                />
                <span className="text-sm">In Stock</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                <span className="text-sm">Feature on homepage</span>
              </label>
            </div>

            <label className="block mb-4">
              <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">
                Images (up to 5{editingId ? ' — uploading replaces existing' : ''})
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setForm({ ...form, images: e.target.files })}
                className="w-full text-sm"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 bg-[#0d0d0d] text-white text-sm font-semibold rounded-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Add product'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-sm rounded-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="md:col-span-2">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : products.length === 0 ? (
            <p className="text-gray-500">No products yet. Add your first one.</p>
          ) : (
            <div className="bg-white rounded-md shadow-sm divide-y divide-gray-100">
              {products.map((p) => (
                <div key={p._id} className="flex items-center gap-4 p-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-sm overflow-hidden shrink-0">
                    {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400">
                      {p.category?.name || 'Uncategorized'} · ₹{p.price} · {p.inStock ? 'In Stock' : 'Out of Stock'}
                      {p.featured ? ' · Featured' : ''}
                    </p>
                  </div>
                  <button onClick={() => handleEdit(p)} className="text-xs font-semibold underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="text-xs font-semibold text-red-500 underline">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
