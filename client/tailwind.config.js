/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    // Override base font size to ensure nothing is tiny
    fontSize: {
      'xs':   ['0.78rem',  { lineHeight: '1.4' }],
      'sm':   ['0.875rem', { lineHeight: '1.5' }],
      'base': ['1rem',     { lineHeight: '1.6' }],
      'lg':   ['1.125rem', { lineHeight: '1.6' }],
      'xl':   ['1.25rem',  { lineHeight: '1.5' }],
      '2xl':  ['1.5rem',   { lineHeight: '1.4' }],
      '3xl':  ['1.875rem', { lineHeight: '1.3' }],
      '4xl':  ['2.25rem',  { lineHeight: '1.2' }],
    },
    extend: {
      colors: {
        slate: {
          150: '#e7ecf3',
          250: '#cdd7e3',
          350: '#94a3b8',
          450: '#64748b',
          455: '#5f6f86',
          550: '#475569',
          650: '#334155',
          750: '#253244',
          850: '#172033',
        },
        primary: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        cyber: {
          purple:  '#14b8a6',
          violet:  '#0ea5e9',
          indigo:  '#2563eb',
          emerald: '#10b981',
          rose:    '#06b6d4',
          amber:   '#14b8a6',
        },
        dark: {
          bg:     '#0b1116',
          card:   'rgba(12, 18, 22, 0.52)',
          border: 'rgba(20, 184, 166, 0.22)',
        },
        light: {
          bg:     '#f4f8fb',
          card:   'rgba(255, 255, 255, 0.55)',
          border: 'rgba(20, 184, 166, 0.16)',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'blob-spin':  'blob-spin 30s infinite linear',
        'blob-spin2': 'blob-spin 22s infinite linear reverse',
        'float-slow': 'float-slow 10s infinite ease-in-out',
        'float-mid':  'float-slow 7s  infinite ease-in-out',
        'slide-up':   'slide-up 0.4s cubic-bezier(0.16,1,0.3,1)',
        'fade-in':    'fade-in 0.4s ease forwards',
      },
      keyframes: {
        'blob-spin': {
          '0%':   { transform: 'rotate(0deg)   scale(1)' },
          '33%':  { transform: 'rotate(120deg) scale(1.12)' },
          '66%':  { transform: 'rotate(240deg) scale(0.92)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        'float-slow': {
          '0%,100%': { transform: 'translateY(0px)   rotate(0deg)' },
          '50%':     { transform: 'translateY(-18px) rotate(4deg)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
