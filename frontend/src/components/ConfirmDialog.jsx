import { useEffect, useState } from 'react';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  loadingLabel = 'Deleting…',
  cancelLabel = 'Cancel',
  danger = true,
  loading = false,
  icon: Icon,
  onConfirm,
  onCancel,
}) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
      const t = setTimeout(() => { setMounted(false); setClosing(false); }, 150);
      return () => clearTimeout(t);
    }
  }, [open, mounted]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm ${closing ? 'animate-fade-out' : 'animate-fade-in'}`}
        onClick={onCancel}
      />
      <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-card-lg p-6 w-full max-w-sm ${closing ? 'animate-pop-out' : 'animate-pop-in'}`}>
        {Icon && (
          <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
            <Icon size={22} className={danger ? 'text-red-500' : 'text-orange-500'} />
          </div>
        )}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">{description}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors active:scale-[0.97]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}`}
          >
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
