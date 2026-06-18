/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        reliance: {
          navy: '#0d1b2a',
          dark: '#1a2744',
          blue: '#1e3a5f',
          accent: '#f59e0b',
          green: '#10b981',
          teal: '#0d9488',
          light: '#e2e8f0',
        },
      },
    },
  },
  plugins: [],
};
