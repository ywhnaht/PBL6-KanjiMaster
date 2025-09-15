/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#2563eb', // Định nghĩa màu primary-600 cho ContentSection.jsx
        },
      },
    },
  },
  plugins: [],
}