/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(154, 52, 18, 0.08), 0 1px 2px -1px rgba(154, 52, 18, 0.06)',
        'card-hover': '0 4px 12px -2px rgba(154, 52, 18, 0.12), 0 2px 4px -2px rgba(154, 52, 18, 0.08)',
        'card-lg': '0 12px 32px -8px rgba(154, 52, 18, 0.18), 0 4px 12px -4px rgba(154, 52, 18, 0.1)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
        'in-out': 'cubic-bezier(0.77, 0, 0.175, 1)',
        drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        'slide-in': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-out': { from: { opacity: '1', transform: 'translateY(0)' }, to: { opacity: '0', transform: 'translateY(8px)' } },
        'pop-in': { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'pop-out': { from: { opacity: '1', transform: 'scale(1)' }, to: { opacity: '0', transform: 'scale(0.95)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
        twinkle: { '0%, 100%': { opacity: '0.25', transform: 'scale(0.85)' }, '50%': { opacity: '1', transform: 'scale(1.1)' } },
        sway: { '0%, 100%': { transform: 'rotate(-2deg)' }, '50%': { transform: 'rotate(2deg)' } },
      },
      animation: {
        'slide-in': 'slide-in 0.2s ease-out',
        'slide-out': 'slide-out 0.2s ease-out',
        'pop-in': 'pop-in 0.18s cubic-bezier(0.23, 1, 0.32, 1)',
        'pop-out': 'pop-out 0.15s cubic-bezier(0.23, 1, 0.32, 1)',
        'fade-in': 'fade-in 0.15s ease-out',
        'fade-out': 'fade-out 0.15s ease-out',
        twinkle: 'twinkle 1.8s ease-in-out infinite',
        sway: 'sway 3.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
