import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Eco / recycling green — primary brand
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        // Reward theme (Gold/Black mockup)
        gold: {
          light: "#F7E7A6",
          DEFAULT: "#D4AF37",
          dark: "#A67C00",
        },
        ink: {
          DEFAULT: "#0B0F0C",
          soft: "#14181A",
          card: "#1B2124",
        },
      },
      fontFamily: {
        sans: ['"Noto Sans Thai"', "Prompt", '"IBM Plex Sans Thai"', "Thonburi", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        float: "0 8px 30px rgb(0 0 0 / 0.12)",
        gold: "0 0 0 1px rgba(212,175,55,0.35), 0 8px 30px rgba(212,175,55,0.15)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
