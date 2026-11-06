/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['"Noto Sans"', '"Noto Sans Sinhala"', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
