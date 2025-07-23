/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rose-powder': '#F8BBD9',
        'peach-coral': '#FFB5A7',
        'sage-green': '#A8C090',
        'sky-blue': '#AED6F1',
        'cream-white': '#FFF8F0',
        'golden-subtle': '#F4E4BC'
      }
    },
  },
  plugins: [],
}
