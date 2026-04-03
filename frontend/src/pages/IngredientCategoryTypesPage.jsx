import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Check, Layers } from 'lucide-react';
import client from '../api/client';

function TypeForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try { await onSave({ name }); }
    catch (err) { setError(err.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
        placeholder="Type name * (e.g. Spices)"
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
          <X size={14} /> Cancel
        </button>
        <button type="submit" disabled={saving} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition disabled:opacity-50">
          <Check size={14} /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export default function IngredientCategoryTypesPage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    setLoading(true);
    try { const { data } = await client.get('/ingredient-category-types'); setTypes(data); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(form) { await client.post('/ingredient-category-types', form); setShowAdd(false); load(); }
  async function handleEdit(id, form) { await client.put(`/ingredient-category-types/${id}`, form); setEditingId(null); load(); }
  async function handleDelete(t) {
    if (!confirm(`Delete type "${t.name}"? Categories using this type will become untyped.`)) return;
    await client.delete(`/ingredient-category-types/${t.id}`);
    load();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Category Types</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Group ingredient categories by type (e.g. Spices, Regular)</p>
        </div>
        {!showAdd && (
          <button onClick={() => { setShowAdd(true); setEditingId(null); }} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition">
            <Plus size={16} /> Add Type
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-4 border border-orange-200 dark:border-orange-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">New Type</h2>
          <TypeForm onSave={handleAdd} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : types.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <Layers size={40} className="mx-auto mb-3 opacity-30" />
          <p>No types yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {types.map(t => (
            <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
              {editingId === t.id ? (
                <div className="p-4">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Edit Type</h2>
                  <TypeForm initial={{ name: t.name }} onSave={form => handleEdit(t.id, form)} onCancel={() => setEditingId(null)} />
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Layers size={16} className="text-orange-400 flex-shrink-0" />
                  <span className="flex-1 font-medium text-gray-800 dark:text-white">{t.name}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => { setEditingId(t.id); setShowAdd(false); }} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(t)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"><Trash2 size={15} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
