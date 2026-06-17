import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useServerStatus } from '../contexts/ServerStatusContext';
import ServerDownIllustration from '../components/ServerDownIllustration';

export default function ServerDownPage() {
  const { retry } = useServerStatus();
  const [retrying, setRetrying] = useState(false);

  async function handleRetry() {
    setRetrying(true);
    await retry();
    setRetrying(false);
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* faint ruled index-card texture — a nod to the literal recipe box this app stands in for */}
      <svg className="absolute inset-0 w-full h-full text-orange-900/[0.045] dark:text-orange-100/[0.035] z-0" aria-hidden="true">
        <defs>
          <pattern id="ruled" width="100%" height="32" patternUnits="userSpaceOnUse">
            <line x1="0" y1="31.5" x2="100%" y2="31.5" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ruled)" />
      </svg>

      {/* soft vignette to pull focus toward the centered card */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(154,52,18,0.07)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.45)_100%)]" />

      {/* two-tone ambient glow */}
      <div className="absolute -top-16 -left-16 w-[360px] h-[360px] z-0 bg-orange-300/25 dark:bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-16 w-[320px] h-[320px] z-0 bg-amber-200/30 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-2xl shadow-card-lg dark:border dark:border-gray-800 p-8 sm:p-10 w-full max-w-sm text-center animate-pop-in overflow-hidden">
        {/* inner top highlight — a hint of edge light, not glassmorphism */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/10 to-transparent" />

        <div className="mb-5 animate-slide-in" style={{ animationDelay: '0ms', animationFillMode: 'backwards' }}>
          <ServerDownIllustration />
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight animate-slide-in" style={{ animationDelay: '60ms', animationFillMode: 'backwards' }}>
          Server unavailable
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-7 leading-relaxed animate-slide-in" style={{ animationDelay: '110ms', animationFillMode: 'backwards' }}>
          We can't reach the server right now. This is temporary — please try again in a moment.
        </p>

        <button
          onClick={handleRetry}
          disabled={retrying}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition-colors duration-150 ease-out active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 animate-slide-in"
          style={{ animationDelay: '160ms', animationFillMode: 'backwards' }}
        >
          <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
          {retrying ? 'Checking…' : 'Try again'}
        </button>

        <p
          className="text-xs text-gray-400 dark:text-gray-500 mt-5 flex items-center justify-center gap-1.5 animate-slide-in"
          style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          Retrying automatically every 5 minutes
        </p>
      </div>
    </div>
  );
}
