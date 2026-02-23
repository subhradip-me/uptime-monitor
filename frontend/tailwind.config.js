/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Minimal Neobrutalism palette
        'neo-yellow': '#FFD93D',
        'neo-blue': '#6BCF7F',
        'neo-red': '#FF6B6B',
        'neo-gray': '#F5F5F5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px rgba(0,0,0,1)',
        'neo-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
      },
    },
  },
  plugins: [],
}