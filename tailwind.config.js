/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  safelist: [
    'max-h-100',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
        },
        'scrollbar-track': 'var(--scrollbar-track, rgba(255, 255, 255, 0.06))',
        'scrollbar-thumb': 'var(--scrollbar-thumb, #f59e0b)',
        'scrollbar-thumb-hover': 'var(--scrollbar-thumb-hover, #d97706)',
        scrollbarTrack: 'var(--scrollbar-track, rgba(255, 255, 255, 0.06))',
        scrollbarThumb: 'var(--scrollbar-thumb, #f59e0b)',
        scrollbarThumbHover: 'var(--scrollbar-thumb-hover, #d97706)',
      },
      spacing: {
        '100': '25rem',
      },
      maxHeight: {
        '100': '25rem',
      },
      borderRadius: {
        '2xs': '1px',
        'xs': '2px',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
