/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a0e27',
          800: '#0f1535',
          700: '#162045',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        surge: {
          400: '#a78bfa',
          500: '#8b5cf6',
        },
      },
    },
  },
  plugins: [],
}
