import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        edumex: {
          yellow: "#FFDE59",
          green: "#05DF72",
          purple: "#7C3AED",
          blue: "#2563EB",
          lightBlue: "#38BDF8",
          charcoal: "#18181B",
          cream: "#FAF9F5",
        },
        canvas: {
          DEFAULT: "var(--bg-canvas)",
          subtle: "var(--bg-subtle)",
        },
        surface: {
          DEFAULT: "var(--bg-surface)",
          hover: "var(--bg-surface-hover)",
          active: "var(--bg-surface-active)",
        },
        border: {
          subtle: "var(--border-subtle)",
          DEFAULT: "var(--border-default)",
        },
        foreground: {
          DEFAULT: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
      },
      boxShadow: {
        hard: "4px 4px 0px #000000",
        "hard-sm": "2px 2px 0px #000000",
        "hard-lg": "6px 6px 0px #000000",
        "hard-xl": "8px 8px 0px #000000",
        "hard-blue": "4px 4px 0px #2563EB",
        "hard-purple": "4px 4px 0px #7C3AED",
        "hard-green": "4px 4px 0px #05DF72",
        "hard-yellow": "4px 4px 0px #FFDE59",
      },
      fontFamily: {
        sans: [
          "'Plus Jakarta Sans'",
          "'Outfit'",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "monospace",
        ],
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        wiggle: "wiggle 3s ease-in-out infinite",
        "float-slow": "floatSlow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
