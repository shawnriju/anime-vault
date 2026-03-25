/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#E91E63",
        "primary-container": "#ff0055",
        "on-primary": "#ffffff",
        "on-primary-container": "#ffffff",
        "secondary": "#ac89ff",
        "surface": "#000000",
        "surface-container": "#0a0a0a",
        "surface-container-highest": "#121212",
        "on-surface": "#ffffff",
        "on-surface-variant": "#d4d4d8",
        "background": "#000000",
        "outline": "#333333",
        "outline-variant": "#222222",
      },
      fontFamily: {
        "headline": ["Epilogue", "sans-serif"],
        "body": ["Manrope", "sans-serif"],
        "label": ["Space Grotesk", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
    },
  },
  plugins: [],
}
