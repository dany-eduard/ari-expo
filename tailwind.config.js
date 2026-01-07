/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    // darkMode: "class",
    extend: {
      colors: {
        primary: "#2563eb", // Blue 600
        "background-page": "#ffffff",
        "surface-input": "#f8fafc", // Slate 50
        "border-input": "#e2e8f0", // Slate 200
        "text-main": "#0f172a", // Slate 900
        "text-secondary": "#64748b", // Slate 500
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
