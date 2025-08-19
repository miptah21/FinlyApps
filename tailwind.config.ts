import type { Config } from "tailwindcss"

export default {
  content: ["./index.html", "./src/App.jsx", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', 
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config