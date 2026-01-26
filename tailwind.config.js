/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    // darkMode: "class",
    extend: {
      colors: {
        primary: "#2563eb", // Blue 600
        "background-light": "#ffffff",
        "background-dark": "#0f172a",
        "card-light": "#ffffff",
        "card-dark": "#1e293b",
        "surface-input-light": "#f8fafc",
        "surface-input-dark": "#334155",
        "border-input-light": "#e2e8f0",
        "border-input-dark": "#475569",
        "text-main-light": "#0f172a",
        "text-main-dark": "#f1f5f9",
        "text-secondary-light": "#64748b",
        "text-secondary-dark": "#94a3b8",
        // Keep these for backward compatibility if used
        "background-page": "#ffffff",
        card: "#ffffff",
        "surface-input": "#f8fafc",
        "border-input": "#e2e8f0",
        "text-main": "#0f172a",
        "text-secondary": "#64748b",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
