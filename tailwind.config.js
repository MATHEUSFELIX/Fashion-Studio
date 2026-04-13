/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#141414",
        paper: "#f7f5f0",
        mist: "#e8e4db",
        clay: "#9c6b5a",
        moss: "#4c6f5b",
        citron: "#c8d86d",
      },
      boxShadow: {
        soft: "0 18px 70px rgba(20, 20, 20, 0.08)",
      },
    },
  },
  plugins: [],
};
