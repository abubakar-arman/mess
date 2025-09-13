/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#60048a',
        secondary: '#3498db',
        accent: '#2ecc71',
        warning: '#f39c12',
        danger: '#e74c3c',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        messmate: {
          "primary": "#60048a",
          "secondary": "#3498db",
          "accent": "#2ecc71",
          "neutral": "#2c3e50",
          "base-100": "#ffffff",
          "base-200": "#f5f7fa",
          "base-300": "#ecf0f1",
          "info": "#3498db",
          "success": "#2ecc71",
          "warning": "#f39c12",
          "error": "#e74c3c",
        },
      },
    ],
  },
}