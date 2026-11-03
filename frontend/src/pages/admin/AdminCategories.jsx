import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Plus, Edit2, Trash2, X, FolderTree } from 'lucide-react';

const emptyForm = { name: '', description: '', sortOrder: 0, image: null };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = () => {
    setLoading(true);
    api
      .get('/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '', sortOrder: cat.sortOrder || 0, image: null });
    setEditingId(cat._id);
    // Scroll form into view on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Products in it will keep referencing it.')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('sortOrder', form.sortOrder);
      if (form.image) fd.append('image', form.image);

      if (editingId) {
        await api.put(`/categories/${editingId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/categories', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-[#0d0d0d] mb-1">Categories</h1>
        <p className="text-gray-500 text-xs sm:text-sm">Organize your products into collections like T-Shirts, Hoodies, etc.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Category Form */}
        <div className="lg:col-span-1">
          <form 
            onSubmit={handleSubmit} 
            className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-black/5 lg:sticky lg:top-6"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="font-semibold text-base text-[#0d0d0d]">
                {editingId ? 'Edit Category' : 'Add New Category'}
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

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graphic Tees"
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
                  placeholder="Short summary of this collection..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Cover Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
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
                {saving ? 'Saving...' : editingId ? 'Update Category' : 'Add Category'}
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

        {/* Categories List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-black/5">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-black/5">
              <FolderTree size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="font-semibold text-gray-700">No categories found</p>
              <p className="text-gray-400 text-xs mt-1">Use the form to add your first category.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-black/5 divide-y divide-gray-100 overflow-hidden">
              <div className="px-5 py-4 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  All Categories ({categories.length})
                </span>
              </div>

              {categories.map((cat) => (
                <div 
                  key={cat._id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-black/5">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <FolderTree size={20} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#0d0d0d] truncate">{cat.name}</p>
                      <p className="text-xs text-gray-400 truncate max-w-xs sm:max-w-md">
                        {cat.description || 'No description provided'}
                      </p>
                      <span className="inline-block mt-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                        Order: {cat.sortOrder || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all text-gray-700"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-red-200 text-red-600 hover:bg-red-50 active:scale-95 transition-all"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;