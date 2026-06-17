import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, Users, Heart } from 'lucide-react';
import client from '../api/client';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Drink', 'Other'];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', difficulty: '' });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const params = { search, ...filters };
      const { data } = await client.get('/recipes', { params });
      setRecipes(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [search, filters]);

  async function toggleFavorite(e, id) {
    e.preventDefault();
    e.stopPropagation();
    await client.post(`/recipes/${id}/favorite`);
    load();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">All Recipes</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
            placeholder="Search recipes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={filters.category}
          onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={filters.difficulty}
          onChange={e => setFilters(f => ({ ...f, difficulty: e.target.value }))}
        >
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <p className="text-lg">No recipes found</p>
          <Link to="/recipes/new" className="text-orange-500 hover:underline mt-2 inline-block">Add your first recipe</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((r, i) => (
            <Link
              key={r.id}
              to={`/recipes/${r.id}`}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-200 overflow-hidden group animate-slide-in"
              style={{ animationDelay: `${Math.min(i, 10) * 30}ms`, animationFillMode: 'backwards' }}
            >
              {r.image_url ? (
                <img src={r.image_url} alt={r.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300 ease-out" />
              ) : (
                <div className="w-full h-40 bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-4xl">🍳</div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{r.title}</h3>
                  <button onClick={e => toggleFavorite(e, r.id)} className="ml-2 flex-shrink-0 transition-transform active:scale-90">
                    <Heart size={18} className={r.is_favorited ? 'fill-red-500 text-red-500' : 'text-gray-300 hover:text-red-400'} />
                  </button>
                </div>
                {r.description && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">{r.description}</p>}
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 dark:text-gray-500">
                  {r.prep_time && <span className="flex items-center gap-1"><Clock size={12} />{r.prep_time + (r.cook_time || 0)}m</span>}
                  {r.servings && <span className="flex items-center gap-1"><Users size={12} />{r.servings}</span>}
                  {r.category && <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full">{r.category}</span>}
                  {r.difficulty && <span className="capitalize">{r.difficulty}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
