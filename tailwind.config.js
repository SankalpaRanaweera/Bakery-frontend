/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
        }
      }
    },
  },
  plugins: [],
}