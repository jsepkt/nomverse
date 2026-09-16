import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/content/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080B11",
        surface: "#0E1420",
        "surface-light": "#172033",
        nomster: {
          DEFAULT: "#22C55E",
          light: "#4ADE80",
          dark: "#15803D",
          glow: "#86EFAC",
        },
        solana: {
          purple: "#9945FF",
          green: "#14F195",
          cyan: "#00C2FF",
        },
        candy: {
          gold: "#FBBF24",
          amber: "#F59E0B",
          glow: "#FDE68A",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 15px rgba(20, 241, 149, 0.3)" },
          "100%": { boxShadow: "0 0 35px rgba(153, 69, 255, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
