/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Terminal theme palette
        'term-bg': '#0c0c0c',
        'term-bg-light': '#1a1a1a',
        'term-border': '#333333',
        'term-green': '#00ff41',
        'term-green-dim': '#00aa2a',
        'term-red': '#ff3333',
        'term-yellow': '#ffcc00',
        'term-blue': '#00ccff',
        'term-cyan': '#00ffff',
        'term-magenta': '#ff00ff',
        'term-white': '#f0f0f0',
        'term-gray': '#808080',
        'term-gray-dark': '#404040',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 10px rgba(0, 255, 65, 0.5)',
        'glow-red': '0 0 10px rgba(255, 51, 51, 0.5)',
        'glow-blue': '0 0 10px rgba(0, 204, 255, 0.5)',
        'terminal': 'inset 0 0 20px rgba(0, 255, 65, 0.05)',
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.95' },
        },
        'glow-pulse': {
          '0%': { boxShadow: '0 0 5px rgba(0, 255, 65, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 255, 65, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}