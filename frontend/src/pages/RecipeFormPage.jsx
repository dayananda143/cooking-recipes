import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import client from '../api/client';
import { useToast } from '../contexts/ToastContext';

const RECIPE_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Drink', 'Other'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const emptyForm = {
  title: '', description: '', category: '', cuisine: '', prep_time: '', cook_time: '',
  servings: '', difficulty: 'medium', image_url: '', is_public: false,
  ingredients: [{ name: '', quantity: '', unit: '', category_id: '' }],
  steps: [{ instruction: '', ingredientIndices: [] }],
  tags: '',
};

export default function RecipeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [ingCategories, setIngCategories] = useState([]);
  const [ingCategoryTypes, setIngCategoryTypes] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catTypeFilter, setCatTypeFilter] = useState('');
  const isEdit = Boolean(id);

  useEffect(() => {
    client.get('/ingredient-categories').then(({ data }) => setIngCategories(data));
    client.get('/ingredient-category-types').then(({ data }) => setIngCategoryTypes(data));
    client.get('/units').then(({ data }) => setUnits(data));
    if (isEdit) {
      client.get(`/recipes/${id}`).then(({ data }) => {
        setForm({
          ...data,
          ingredients: data.ingredients?.length
            ? data.ingredients.map(i => ({
                ...i,
                quantity:    i.quantity    ?? '',
                unit:        i.unit        ?? '',
                category_id: i.category_id ?? '',
              }))
            : [{ name: '', quantity: '', unit: '', category_id: '' }],
          steps: data.steps?.length
            ? data.steps.map(s => ({
                instruction: s.instruction,
                ingredientIndices: (s.ingredientIds || []).map(ingId => {
                  const idx = data.ingredients?.findIndex(i => i.id === ingId);
                  return idx >= 0 ? idx : null;
                }).filter(idx => idx !== null),
              }))
            : [{ instruction: '', ingredientIndices: [] }],
          tags: data.tags?.join(', ') || '',
          prep_time: data.prep_time || '',
          cook_time: data.cook_time || '',
          servings: data.servings || '',
          is_public: Boolean(data.is_public),
        });
      });
    }
  }, [id]);

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function setIngredient(i, key, val) {
    setForm(f => { const ings = [...f.ingredients]; ings[i] = { ...ings[i], [key]: val }; return { ...f, ingredients: ings }; });
  }
  function addIngredient() { setForm(f => ({ ...f, ingredients: [...f.ingredients, { name: '', quantity: '', unit: '', category_id: '' }] })); }
  function removeIngredient(idx) {
    setForm(f => ({
      ...f,
      ingredients: f.ingredients.filter((_, j) => j !== idx),
      // shift ingredient indices in steps
      steps: f.steps.map(s => ({
        ...s,
        ingredientIndices: s.ingredientIndices
          .filter(i => i !== idx)
          .map(i => i > idx ? i - 1 : i),
      })),
    }));
  }

  function setStepInstruction(i, val) {
    setForm(f => { const s = [...f.steps]; s[i] = { ...s[i], instruction: val }; return { ...f, steps: s }; });
  }
  function addStep() { setForm(f => ({ ...f, steps: [...f.steps, { instruction: '', ingredientIndices: [] }] })); }
  function removeStep(i) { setForm(f => ({ ...f, steps: f.steps.filter((_, j) => j !== i) })); }
  function toggleStepIngredient(stepIdx, ingIdx) {
    setForm(f => {
      const steps = [...f.steps];
      const step = { ...steps[stepIdx] };
      step.ingredientIndices = step.ingredientIndices.includes(ingIdx)
        ? step.ingredientIndices.filter(i => i !== ingIdx)
        : [...step.ingredientIndices, ingIdx];
      steps[stepIdx] = step;
      return { ...f, steps };
    });
  }

  const allCatOptions = ingCategories.map(c => ({ value: c.id, label: c.name, color: c.color, type_id: c.type_id }));
  const catSelectOptions = catTypeFilter
    ? allCatOptions.filter(o => String(o.type_id) === catTypeFilter)
    : allCatOptions;

  function getIngDisplayName(ing) {
    if (ing.name && ing.name.trim()) return ing.name.trim();
    return allCatOptions.find(o => String(o.value) === String(ing.category_id))?.label || '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const savedIngredients = form.ingredients
      .map(i => {
        const catName = catSelectOptions.find(o => String(o.value) === String(i.category_id))?.label;
        const name = (i.name && i.name.trim()) ? i.name.trim() : (catName || '');
        return { ...i, name, category_id: i.category_id ? Number(i.category_id) : null };
      })
      .filter(i => i.name);

    const payload = {
      ...form,
      prep_time: form.prep_time ? Number(form.prep_time) : null,
      cook_time: form.cook_time ? Number(form.cook_time) : null,
      servings: form.servings ? Number(form.servings) : null,
      ingredients: savedIngredients,
      steps: form.steps
        .filter(s => s.instruction.trim())
        .map(s => ({ instruction: s.instruction, ingredientIndices: s.ingredientIndices })),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    try {
      if (isEdit) {
        await client.put(`/recipes/${id}`, payload);
        navigate(`/recipes/${id}`);
      } else {
        const { data } = await client.post('/recipes', payload);
        navigate(`/recipes/${data.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400";
  const sectionClass = "bg-white dark:bg-gray-800 rounded-xl p-4 shadow space-y-4";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to={isEdit ? `/recipes/${id}` : '/recipes'} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{isEdit ? 'Edit Recipe' : 'New Recipe'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className={sectionClass}>
          <h2 className="font-semibold text-gray-700 dark:text-gray-300">Basic Info</h2>
          <input className={inputClass} placeholder="Recipe title *" value={form.title} onChange={e => setField('title', e.target.value)} required />
          <textarea className={`${inputClass} resize-none h-24`} placeholder="Description" value={form.description} onChange={e => setField('description', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <select className={inputClass} value={form.category} onChange={e => setField('category', e.target.value)}>
              <option value="">Category</option>
              {RECIPE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input className={inputClass} placeholder="Cuisine (e.g. Italian)" value={form.cuisine} onChange={e => setField('cuisine', e.target.value)} />
            <input className={inputClass} type="number" placeholder="Prep time (min)" value={form.prep_time} onChange={e => setField('prep_time', e.target.value)} />
            <input className={inputClass} type="number" placeholder="Cook time (min)" value={form.cook_time} onChange={e => setField('cook_time', e.target.value)} />
            <input className={inputClass} type="number" placeholder="Servings" value={form.servings} onChange={e => setField('servings', e.target.value)} />
            <select className={inputClass} value={form.difficulty} onChange={e => setField('difficulty', e.target.value)}>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </select>
          </div>
          <input className={inputClass} placeholder="Image URL (optional)" value={form.image_url} onChange={e => setField('image_url', e.target.value)} />
          <input className={inputClass} placeholder="Tags (comma separated, e.g. vegan, quick, spicy)" value={form.tags} onChange={e => setField('tags', e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input type="checkbox" checked={form.is_public} onChange={e => setField('is_public', e.target.checked)} className="accent-orange-500" />
            Make this recipe public
          </label>
        </section>

        <section className={sectionClass}>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-gray-700 dark:text-gray-300">Ingredients</h2>
            {ingCategoryTypes.length > 0 && (
              <div className="flex flex-wrap gap-1 ml-auto">
                <button
                  type="button"
                  onClick={() => setCatTypeFilter('')}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition ${!catTypeFilter ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >All</button>
                {ingCategoryTypes.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCatTypeFilter(catTypeFilter === String(t.id) ? '' : String(t.id))}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition ${catTypeFilter === String(t.id) ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >{t.name}</button>
                ))}
              </div>
            )}
          </div>

          {form.ingredients.map((ing, i) => (
            <div key={i} className="flex items-center gap-2">
              {catSelectOptions.length > 0 && (
                <select
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400 flex-shrink-0"
                  value={ing.category_id}
                  onChange={e => setIngredient(i, 'category_id', e.target.value)}
                >
                  <option value="">Category</option>
                  {catSelectOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              )}
              <input className={`${inputClass} w-14`} placeholder="Qty" value={ing.quantity} onChange={e => setIngredient(i, 'quantity', e.target.value)} />
              <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 flex-shrink-0" value={ing.unit} onChange={e => setIngredient(i, 'unit', e.target.value)}>
                <option value="">Unit</option>
                {units.map(u => (
                  <option key={u.id} value={u.abbreviation || u.name}>
                    {u.abbreviation ? `${u.abbreviation} (${u.name})` : u.name}
                  </option>
                ))}
              </select>
              {form.ingredients.length > 1 && (
                <button type="button" onClick={() => removeIngredient(i)} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 size={16} /></button>
              )}
            </div>
          ))}

          <button type="button" onClick={addIngredient} className="flex items-center gap-1 text-orange-500 hover:text-orange-700 text-sm">
            <Plus size={16} /> Add ingredient
          </button>
        </section>

        <section className={sectionClass}>
          <h2 className="font-semibold text-gray-700 dark:text-gray-300">Instructions</h2>
          {form.steps.map((step, i) => {
            const namedIngredients = form.ingredients
              .map((ing, ingIdx) => ({ ing, ingIdx, label: getIngDisplayName(ing) }))
              .filter(x => x.label);
            return (
              <div key={i} className="flex gap-2 items-start">
                <span className="w-7 h-7 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">{i + 1}</span>
                <div className="flex-1 space-y-2">
                  <textarea
                    className={`${inputClass} resize-none h-20`}
                    placeholder={`Step ${i + 1}`}
                    value={step.instruction}
                    onChange={e => setStepInstruction(i, e.target.value)}
                  />
                  {namedIngredients.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {namedIngredients.map(({ ing, ingIdx, label }) => {
                        const selected = step.ingredientIndices.includes(ingIdx);
                        return (
                          <button
                            key={ingIdx}
                            type="button"
                            onClick={() => toggleStepIngredient(i, ingIdx)}
                            className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${
                              selected
                                ? 'bg-orange-500 text-white border-orange-500'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-orange-400'
                            }`}
                          >
                            {ing.quantity ? `${ing.quantity}${ing.unit ? ` ${ing.unit}` : ''} ` : ''}{label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {form.steps.length > 1 && (
                  <button type="button" onClick={() => removeStep(i)} className="text-red-400 hover:text-red-600 mt-1"><Trash2 size={16} /></button>
                )}
              </div>
            );
          })}
          <button type="button" onClick={addStep} className="flex items-center gap-1 text-orange-500 hover:text-orange-700 text-sm">
            <Plus size={16} /> Add step
          </button>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Recipe'}
        </button>
      </form>
    </div>
  );
}
