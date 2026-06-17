import { useState } from 'react';
import { Menu, Sun, Moon, LogOut, ChefHat, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);

  const initial = user?.username?.[0]?.toUpperCase() ?? '?';

  function closeMenu() {
    setMenuClosing(true);
    setTimeout(() => { setShowMenu(false); setMenuClosing(false); }, 150);
  }

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center px-3 sm:px-6 gap-2 sm:gap-4 shrink-0 z-10">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md transition-colors active:scale-90"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2 lg:hidden">
        <ChefHat size={18} className="text-orange-500" />
        <span className="text-base font-bold text-gray-900 dark:text-white">Cooking Recipes</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md transition-colors active:scale-90"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative pl-2 border-l border-gray-200 dark:border-gray-700">
          <button
            onClick={() => (showMenu ? closeMenu() : setShowMenu(true))}
            className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95"
          >
            <span className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
              {initial}
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 hidden sm:block max-w-[80px] truncate">
              {user?.username}
            </span>
            <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={closeMenu} />
              <div
                className={`absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-card-lg z-20 min-w-[180px] overflow-hidden origin-top-right ${menuClosing ? 'animate-pop-out' : 'animate-pop-in'}`}
              >
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-sm font-bold shrink-0 select-none">
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.username}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{user?.role === 'admin' ? 'Administrator' : 'Member'}</p>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { closeMenu(); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors active:scale-[0.98] text-left"
                  >
                    <LogOut size={15} className="text-red-500 shrink-0" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
