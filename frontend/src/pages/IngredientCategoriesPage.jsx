import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Check, Tag } from 'lucide-react';
import client from '../api/client';
import ConfirmDialog from '../components/ConfirmDialog';

const PRESET_COLORS = [
  '#f97316', '#ef4444', '#eab308', '#22c55e', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1',
];

function CategoryForm({ initial, types, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial ?? { name: '', color: '#f97316', description: '', type_id: '' }
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      await onSave({ ...form, type_id: form.type_id ? Number(form.type_id) : null });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        <input
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Category name *"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          autoFocus
        />
        <input
          type="color"
          className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer p-0.5 bg-white dark:bg-gray-700 flex-shrink-0"
          value={form.color}
          onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
          title="Pick color"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map(c => (
          <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
            className="w-6 h-6 rounded-full border-2 transition-transform duration-150 ease-out hover:scale-110 active:scale-95"
            style={{ backgroundColor: c, borderColor: form.color === c ? '#1f2937' : 'transparent' }}
          />
        ))}
      </div>

      <select
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
        value={form.type_id}
        onChange={e => setForm(f => ({ ...f, type_id: e.target.value }))}
      >
        <option value="">No type</option>
        {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      <input
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
        placeholder="Description (optional)"
        value={form.description}
        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors active:scale-95">
          <X size={14} /> Cancel
        </button>
        <button type="submit" disabled={saving} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors active:scale-95 disabled:opacity-50 disabled:active:scale-100">
          <Check size={14} /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export default function IngredientCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [{ data: cats }, { data: typs }] = await Promise.all([
        client.get('/ingredient-categories'),
        client.get('/ingredient-category-types'),
      ]);
      setCategories(cats);
      setTypes(typs);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(form) { await client.post('/ingredient-categories', form); setShowAdd(false); load(); }
  async function handleEdit(id, form) { await client.put(`/ingredient-categories/${id}`, form); setEditingId(null); load(); }
  async function confirmDelete() {
    setDeleting(true);
    try {
      await client.delete(`/ingredient-categories/${deleteTarget.id}`);
      setDeleteTarget(null);
      load();
    } finally {
      setDeleting(false);
    }
  }

  const filtered = filterType ? categories.filter(c => String(c.type_id) === filterType) : categories;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ingredient Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Organize ingredients into groups</p>
        </div>
        {!showAdd && (
          <button onClick={() => { setShowAdd(true); setEditingId(null); }} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors active:scale-95">
            <Plus size={16} /> Add Category
          </button>
        )}
      </div>

      {/* Type filter */}
      {types.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilterType('')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors active:scale-95 ${!filterType ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >All</button>
          {types.map(t => (
            <button
              key={t.id}
              onClick={() => setFilterType(String(t.id))}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors active:scale-95 ${filterType === String(t.id) ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >{t.name}</button>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 mb-4 border border-orange-200 dark:border-orange-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">New Category</h2>
          <CategoryForm types={types} onSave={handleAdd} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <Tag size={40} className="mx-auto mb-3 opacity-30" />
          <p>No categories{filterType ? ' for this type' : ''}. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(cat => (
            <div key={cat.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              {editingId === cat.id ? (
                <div className="p-4">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Edit Category</h2>
                  <CategoryForm
                    types={types}
                    initial={{ name: cat.name, color: cat.color, description: cat.description || '', type_id: cat.type_id ?? '' }}
                    onSave={form => handleEdit(cat.id, form)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-800 dark:text-white">{cat.name}</span>
                      {cat.type_name && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">{cat.type_name}</span>
                      )}
                      <span className="text-xs text-gray-400">{cat.ingredient_count} ingredient{cat.ingredient_count !== 1 ? 's' : ''}</span>
                    </div>
                    {cat.description && <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{cat.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => { setEditingId(cat.id); setShowAdd(false); }} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-90"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteTarget(cat)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-90"><Trash2 size={15} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete category"
        description={
          deleteTarget?.ingredient_count > 0
            ? `"${deleteTarget.name}" is used by ${deleteTarget.ingredient_count} ingredient(s). They will be uncategorized. Delete anyway?`
            : `Delete category "${deleteTarget?.name}"?`
        }
        icon={Trash2}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
