import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type, leaving: false }]);
    setTimeout(() => leave(id), 3300);
  }, []);

  function leave(id) {
    setToasts(t => t.map(x => x.id === id ? { ...x, leaving: true } : x));
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 200);
  }

  function dismiss(id) {
    leave(id);
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto min-w-[240px] max-w-sm
              ${t.leaving ? 'animate-slide-out' : 'animate-slide-in'}
              ${t.type === 'success' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' :
                t.type === 'error'   ? 'bg-red-500 text-white' :
                                       'bg-blue-500 text-white'}`}
          >
            {t.type === 'success' ? <CheckCircle size={16} className="flex-shrink-0 text-green-400 dark:text-green-600" /> :
             t.type === 'error'   ? <XCircle size={16} className="flex-shrink-0" /> :
                                    <Info size={16} className="flex-shrink-0" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100 flex-shrink-0 transition-opacity active:scale-90">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
