import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { ChefHat, BookOpen, Heart, Plus, X, Tag, Ruler, Layers } from 'lucide-react';

const links = [
  { to: '/recipes',   label: 'All Recipes', Icon: BookOpen, end: true },
  { to: '/favorites', label: 'Favorites',   Icon: Heart    },
];

const manageLinks = [
  { to: '/ingredient-categories',      label: 'Ing. Categories', Icon: Tag    },
  { to: '/ingredient-category-types',  label: 'Category Types',  Icon: Layers },
  { to: '/units',                      label: 'Units',           Icon: Ruler  },
];

export default function Sidebar({ onClose }) {
  const linkClass = ({ isActive }) =>
    clsx(
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
      isActive
        ? 'bg-orange-600 text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    );

  return (
    <aside className="w-56 h-full shrink-0 bg-gray-900 text-white flex flex-col">
      {/* Mobile close button */}
      <div className="flex items-center justify-between px-4 py-3 lg:hidden border-b border-gray-700">
        <div className="flex items-center gap-2">
          <ChefHat size={18} className="text-orange-400" />
          <span className="text-sm font-bold text-white">Cooking Recipes</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
          <X size={18} />
        </button>
      </div>

      {/* Desktop logo */}
      <div className="px-4 py-5 hidden lg:block border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <ChefHat size={16} className="text-white" />
          </span>
          <span className="text-sm font-bold text-white">Cooking Recipes</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={!!end} className={linkClass} onClick={onClose}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        <div className="pt-4">
          <NavLink
            to="/recipes/new"
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-orange-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            )}
            onClick={onClose}
          >
            <Plus size={16} />
            New Recipe
          </NavLink>
        </div>

        <div className="pt-4 pb-1 px-3">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Manage</span>
        </div>
        {manageLinks.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={linkClass} onClick={onClose}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
