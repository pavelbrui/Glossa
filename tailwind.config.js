/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#ff5722',
          red: '#f44336'
        }
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [
    function({ addComponents }) {
      addComponents({
        '.form-input': {
          '@apply w-full rounded-lg border-2 border-gray-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50': {},
        },
        '.form-select': {
          '@apply w-full rounded-lg border-2 border-gray-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50': {},
        },
        '.form-textarea': {
          '@apply w-full rounded-lg border-2 border-gray-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50': {},
        }
      })
    }
  ],
};