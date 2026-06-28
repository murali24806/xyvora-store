import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

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
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '', sortOrder: cat.sortOrder || 0, image: null });
    setEditingId(cat._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Products in it will keep referencing it.')) return;
    await api.delete(`/categories/${id}`);
    fetchCategories();
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
    <div>
      <h1 className="font-display text-3xl mb-1">Categories</h1>
      <p className="text-gray-500 text-sm mb-8">Organize your products into categories like T-Shirts, Hoodies, etc.</p>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-md p-6 shadow-sm sticky top-6">
            <h2 className="font-semibold mb-4">{editingId ? 'Edit category' : 'Add new category'}</h2>

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

            <label className="block mb-3">
              <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Sort order</span>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm"
              />
            </label>

            <label className="block mb-4">
              <span className="block text-xs uppercase tracking-widest text-gray-400 mb-1">Image (optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                className="w-full text-sm"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 bg-[#0d0d0d] text-white text-sm font-semibold rounded-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Add category'}
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
          ) : categories.length === 0 ? (
            <p className="text-gray-500">No categories yet. Add your first one.</p>
          ) : (
            <div className="bg-white rounded-md shadow-sm divide-y divide-gray-100">
              {categories.map((cat) => (
                <div key={cat._id} className="flex items-center gap-4 p-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-sm overflow-hidden shrink-0">
                    {cat.image && <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{cat.name}</p>
                    <p className="text-xs text-gray-400 truncate">{cat.description || 'No description'}</p>
                  </div>
                  <button onClick={() => handleEdit(cat)} className="text-xs font-semibold underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(cat._id)} className="text-xs font-semibold text-red-500 underline">
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

export default AdminCategories;
