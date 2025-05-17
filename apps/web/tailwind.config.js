/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'blue': {
          50: '#eaf5ff',
          100: '#d0e7ff',
          200: '#a6d0ff',
          300: '#75b4ff',
          400: '#4896ff',
          500: '#1a70ff',
          600: '#0057ff',
          700: '#0044cc',
          800: '#0038a8',
          900: '#003384',
        },
      },
    },
  },
  plugins: [],
}; 