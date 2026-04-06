/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A237E',
          light: '#3949AB',
          lighter: '#E8EAF6',
          dark: '#0D1B6E',
        },
        success: { DEFAULT: '#2E7D32', light: '#E8F5E9' },
        danger: { DEFAULT: '#C62828', light: '#FFEBEE' },
        warning: { DEFAULT: '#F57F17', light: '#FFF8E1' },
        surface: '#F5F6FA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(26, 35, 126, 0.08)',
        modal: '0 8px 32px rgba(26, 35, 126, 0.18)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
};
