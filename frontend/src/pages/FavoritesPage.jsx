import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Heart } from 'lucide-react';
import client from '../api/client';

export default function FavoritesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await client.get('/recipes', { params: { favorited: '1' } });
      setRecipes(data.filter(r => r.is_favorited));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleFavorite(e, id) {
    e.preventDefault();
    e.stopPropagation();
    await client.post(`/recipes/${id}/favorite`);
    load();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Favorites</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <Heart size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg">No favorites yet</p>
          <Link to="/recipes" className="text-orange-500 hover:underline mt-2 inline-block">Browse recipes</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map(r => (
            <Link key={r.id} to={`/recipes/${r.id}`} className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition overflow-hidden group">
              {r.image_url ? (
                <img src={r.image_url} alt={r.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-full h-40 bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-4xl">🍳</div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">{r.title}</h3>
                  <button onClick={e => toggleFavorite(e, r.id)} className="ml-2 flex-shrink-0">
                    <Heart size={18} className="fill-red-500 text-red-500" />
                  </button>
                </div>
                {r.description && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">{r.description}</p>}
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 dark:text-gray-500">
                  {r.prep_time && <span className="flex items-center gap-1"><Clock size={12} />{r.prep_time + (r.cook_time || 0)}m</span>}
                  {r.servings && <span className="flex items-center gap-1"><Users size={12} />{r.servings}</span>}
                  {r.category && <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full">{r.category}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
