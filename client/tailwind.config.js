/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['"Noto Sans Sinhala"', '"Noto Sans"', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
