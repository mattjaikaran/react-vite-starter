/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#4f66e8',
          600: '#334bcc',
          700: '#293da6',
          800: '#253584',
          900: '#222f69',
          950: '#171e43',
        },
      },
    },
  },
  plugins: [],
}
