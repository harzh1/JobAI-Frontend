/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#3442FF",
          black: "#111111",
          white: "#FFFFFF",
          ice: "#F0F2FF",
          gray: "#9CA3AF",
        },
        indigo: {
          50: '#F0F2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#3442FF', // Brand Blue
          700: '#2A35CC',
          800: '#202899',
          900: '#151A66',
          950: '#0A0D33',
        },
        dark: {
          50: "#f8f9fc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "sans-serif"],
        heading: ['"Plus Jakarta Sans"', "sans-serif"],
      },
      animation: {
        spin: "spin 1s linear infinite",
      },
    },
  },
  plugins: [],
  darkMode: ["class", ".theme-dark"],
};
