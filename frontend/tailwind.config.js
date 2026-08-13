/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'Courier New', 'monospace'],
      },
      colors: {
        goa: {
          green: '#0B6623',
          'green-dark': '#0A3D1A',
          'green-deep': '#072E14',
          'green-muted': '#1A5C32',
        },
        hh: {
          pink: '#E8115B',
          'pink-hot': '#FF1493',
          'pink-muted': '#C9185A',
        },
        sun: {
          gold: '#EAAA00',
          'gold-light': '#F5CC4D',
          'gold-muted': '#D4990A',
        },
        sand: {
          DEFAULT: '#E8D9A0',
          light: '#F2E8C4',
          dark: '#C4B580',
        },
        ink: {
          black: '#1A1A1A',
          dark: '#111111',
        },
        cream: '#FDF8EC',
        'off-white': '#FAF7F0',
      },
      screens: {
        'xs': '375px',
        'sm': '390px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1440px',
      },
    },
  },
  plugins: [],
}
