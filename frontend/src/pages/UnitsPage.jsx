import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Check, Ruler } from 'lucide-react';
import client from '../api/client';
import ConfirmDialog from '../components/ConfirmDialog';

function UnitForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ?? { name: '', abbreviation: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
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
          placeholder="Unit name * (e.g. teaspoon)"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          autoFocus
        />
        <input
          className="w-28 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Abbrev. (tsp)"
          value={form.abbreviation}
          onChange={e => setForm(f => ({ ...f, abbreviation: e.target.value }))}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors active:scale-95"
        >
          <X size={14} /> Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          <Check size={14} /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export default function UnitsPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await client.get('/units');
      setUnits(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(form) {
    await client.post('/units', form);
    setShowAdd(false);
    load();
  }

  async function handleEdit(id, form) {
    await client.put(`/units/${id}`, form);
    setEditingId(null);
    load();
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await client.delete(`/units/${deleteTarget.id}`);
      setDeleteTarget(null);
      load();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Units</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage measurement units used in recipes</p>
        </div>
        {!showAdd && (
          <button
            onClick={() => { setShowAdd(true); setEditingId(null); }}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors active:scale-95"
          >
            <Plus size={16} /> Add Unit
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 mb-4 border border-orange-200 dark:border-orange-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">New Unit</h2>
          <UnitForm onSave={handleAdd} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : units.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <Ruler size={40} className="mx-auto mb-3 opacity-30" />
          <p>No units yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {units.map(unit => (
            <div key={unit.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              {editingId === unit.id ? (
                <div className="p-4">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Edit Unit</h2>
                  <UnitForm
                    initial={{ name: unit.name, abbreviation: unit.abbreviation || '' }}
                    onSave={form => handleEdit(unit.id, form)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <span className="font-medium text-gray-800 dark:text-white">{unit.name}</span>
                    {unit.abbreviation && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-mono">
                        {unit.abbreviation}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => { setEditingId(unit.id); setShowAdd(false); }}
                      className="p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-90"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(unit)}
                      className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-90"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete unit"
        description={`Delete unit "${deleteTarget?.name}"?`}
        icon={Trash2}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
