/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFD700',
        secondary: '#DAA520',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        'noto-serif': ['"Noto Serif SC"', 'serif'],
      },
    },
  },
  plugins: [],
} 