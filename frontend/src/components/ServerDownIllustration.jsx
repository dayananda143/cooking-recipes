export default function ServerDownIllustration() {
  return (
    <svg viewBox="0 0 240 200" className="w-44 h-auto mx-auto" aria-hidden="true">
      {/* wall plate */}
      <rect x="146" y="34" width="68" height="100" rx="14" className="fill-gray-100 dark:fill-gray-800" />
      <rect x="146" y="34" width="68" height="100" rx="14" className="fill-none stroke-gray-200 dark:stroke-gray-700" strokeWidth="2" />
      {/* outlet slots */}
      <rect x="166" y="58" width="9" height="24" rx="4.5" className="fill-gray-300 dark:fill-gray-600" />
      <rect x="186" y="58" width="9" height="24" rx="4.5" className="fill-gray-300 dark:fill-gray-600" />
      <circle cx="180" cy="104" r="7" className="fill-gray-300 dark:fill-gray-600" />

      {/* slack cord, fallen away from the outlet — sways gently like it just dropped */}
      <g className="animate-sway" style={{ transformOrigin: '86px 83px' }}>
        <path
          d="M86 83 C 55 95, 45 130, 55 155 C 60 168, 50 178, 32 176"
          className="fill-none stroke-gray-300 dark:stroke-gray-600"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>

      {/* plug head, prongs facing the outlet */}
      <rect x="86" y="70" width="34" height="26" rx="7" className="fill-orange-500" />
      <rect x="120" y="76" width="14" height="5" rx="2.5" className="fill-orange-500" />
      <rect x="120" y="89" width="14" height="5" rx="2.5" className="fill-orange-500" />

      {/* disconnect gap marks — twinkle to suggest an ongoing, unsuccessful reconnect attempt */}
      <circle cx="138" cy="80" r="2.5" className="fill-orange-300 dark:fill-orange-700 origin-center animate-twinkle" style={{ animationDelay: '0ms' }} />
      <circle cx="142" cy="86" r="2.5" className="fill-orange-300 dark:fill-orange-700 origin-center animate-twinkle" style={{ animationDelay: '300ms' }} />
      <circle cx="138" cy="92" r="2.5" className="fill-orange-300 dark:fill-orange-700 origin-center animate-twinkle" style={{ animationDelay: '600ms' }} />
    </svg>
  );
}
