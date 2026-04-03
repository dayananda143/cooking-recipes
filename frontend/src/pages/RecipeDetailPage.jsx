import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Clock, Users, Heart, Globe, ChefHat, UtensilsCrossed } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ingredients');
  const [imgError, setImgError] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    client.get(`/recipes/${id}`).then(({ data }) => setRecipe(data)).finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    await client.delete(`/recipes/${id}`);
    navigate('/recipes');
  }

  async function toggleFavorite() {
    const { data } = await client.post(`/recipes/${id}/favorite`);
    setRecipe(r => ({ ...r, is_favorited: data.favorited ? 1 : 0 }));
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-gray-400">
      <ChefHat size={32} className="animate-pulse" />
    </div>
  );
  if (!recipe) return <div className="text-center py-12 text-gray-400">Recipe not found</div>;

  const isOwner = user?.id === recipe.user_id;
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  // Group ingredients by category
  const groups = {};
  (recipe.ingredients || []).forEach(ing => {
    const key = ing.category_id ? `${ing.category_id}` : '__none__';
    if (!groups[key]) groups[key] = { name: ing.category_name || null, color: ing.category_color || null, items: [] };
    groups[key].items.push(ing);
  });
  const groupKeys = Object.keys(groups);
  const hasCats = groupKeys.some(k => k !== '__none__');

  return (
    <div className="max-w-3xl mx-auto pb-12">

      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/recipes" className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1" />
        <button
          onClick={toggleFavorite}
          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
        >
          <Heart size={20} className={recipe.is_favorited ? 'fill-red-500 text-red-500' : 'text-gray-300 hover:text-red-400'} />
        </button>
        {isOwner && (
          <>
            <Link to={`/recipes/${id}/edit`} className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
              <Edit size={18} />
            </Link>
            <button onClick={() => setShowDeleteDialog(true)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>

      {/* Hero image or placeholder */}
      {recipe.image_url && !imgError ? (
        <div className="relative mb-6 rounded-2xl overflow-hidden shadow-md">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-72 object-cover"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-gray-800 rounded-2xl flex items-center justify-center mb-6">
          <UtensilsCrossed size={48} className="text-orange-300 dark:text-orange-700" />
        </div>
      )}

      {/* Title + badges */}
      <div className="mb-5">
        <div className="flex flex-wrap gap-2 mb-3">
          {recipe.category && (
            <span className="text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full">{recipe.category}</span>
          )}
          {recipe.cuisine && (
            <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full">{recipe.cuisine}</span>
          )}
          {recipe.difficulty && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
              recipe.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
              recipe.difficulty === 'hard' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
              'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
            }`}>{recipe.difficulty}</span>
          )}
          {recipe.is_public ? (
            <span className="text-xs font-medium flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-full">
              <Globe size={11} /> Public
            </span>
          ) : null}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{recipe.title}</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500">by <span className="text-gray-600 dark:text-gray-300 font-medium">{recipe.author}</span></p>
      </div>

      {/* Time / servings stats */}
      {(recipe.prep_time || recipe.cook_time || recipe.servings) && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {recipe.prep_time ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm border border-gray-100 dark:border-gray-700">
              <Clock size={16} className="mx-auto mb-1 text-orange-400" />
              <div className="text-lg font-bold text-gray-800 dark:text-white">{recipe.prep_time}m</div>
              <div className="text-xs text-gray-400">Prep</div>
            </div>
          ) : <div />}
          {recipe.cook_time ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm border border-gray-100 dark:border-gray-700">
              <Clock size={16} className="mx-auto mb-1 text-orange-400" />
              <div className="text-lg font-bold text-gray-800 dark:text-white">{recipe.cook_time}m</div>
              <div className="text-xs text-gray-400">Cook</div>
            </div>
          ) : <div />}
          {recipe.servings ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm border border-gray-100 dark:border-gray-700">
              <Users size={16} className="mx-auto mb-1 text-orange-400" />
              <div className="text-lg font-bold text-gray-800 dark:text-white">{recipe.servings}</div>
              <div className="text-xs text-gray-400">Servings</div>
            </div>
          ) : <div />}
        </div>
      )}

      {/* Description */}
      {recipe.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-sm bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          {recipe.description}
        </p>
      )}

      {/* Tags */}
      {recipe.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {recipe.tags.map(t => (
            <span key={t} className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full text-xs">#{t}</span>
          ))}
        </div>
      )}

      {/* Tabs */}
      {(recipe.ingredients?.length > 0 || recipe.steps?.length > 0) && (
        <div>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-5">
            <button
              onClick={() => setTab('ingredients')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                tab === 'ingredients'
                  ? 'bg-white dark:bg-gray-700 text-orange-500 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Ingredients {recipe.ingredients?.length > 0 && <span className="text-xs opacity-60 ml-1">({recipe.ingredients.length})</span>}
            </button>
            <button
              onClick={() => setTab('steps')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                tab === 'steps'
                  ? 'bg-white dark:bg-gray-700 text-orange-500 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Instructions {recipe.steps?.length > 0 && <span className="text-xs opacity-60 ml-1">({recipe.steps.length})</span>}
            </button>
          </div>

          {/* Ingredients tab */}
          {tab === 'ingredients' && recipe.ingredients?.length > 0 && (
            <div className="space-y-3">
              {!hasCats ? (
                recipe.ingredients.map(ing => (
                  <div key={ing.id} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-orange-400" />
                    <span className="flex-1 font-medium text-gray-800 dark:text-gray-100 text-sm">{ing.name}</span>
                    {ing.quantity && (
                      <span className="text-sm font-semibold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2.5 py-0.5 rounded-full">
                        {ing.quantity}{ing.unit ? ` ${ing.unit}` : ''}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                groupKeys.map(key => {
                  const group = groups[key];
                  const color = group.color || '#f97316';
                  return (
                    <div key={key}>
                      {group.name && (
                        <div className="flex items-center gap-2 px-1 mb-2 mt-4 first:mt-0">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{group.name}</span>
                          <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        </div>
                      )}
                      <div className="space-y-2">
                        {group.items.map(ing => (
                          <div key={ing.id} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                            <span className="flex-1 font-medium text-gray-800 dark:text-gray-100 text-sm">{ing.name}</span>
                            {ing.quantity && (
                              <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
                                {ing.quantity}{ing.unit ? ` ${ing.unit}` : ''}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Steps tab */}
          {tab === 'steps' && recipe.steps?.length > 0 && (
            <div className="space-y-3">
              {recipe.steps.map(s => {
                const stepIngs = (s.ingredientIds || [])
                  .map(ingId => recipe.ingredients?.find(i => i.id === ingId))
                  .filter(Boolean);
                return (
                  <div key={s.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {s.step_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-sm">{s.instruction}</p>
                      {stepIngs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {stepIngs.map(ing => (
                            <span key={ing.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                              {ing.quantity ? <span className="font-bold">{ing.quantity}{ing.unit ? ` ${ing.unit}` : ''}</span> : null}
                              {ing.quantity ? <span className="opacity-50">·</span> : null}
                              {ing.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteDialog(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-1">Delete Recipe</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-700 dark:text-gray-200">"{recipe.title}"</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
