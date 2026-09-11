import type { Config } from "tailwindcss";

export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        paper: "var(--paper)",
        honey: "var(--honey)",
        alert: "var(--alert)",
        soft: "var(--soft)",
        line: "var(--line)",
      },
      fontFamily: {
        serif: ["Newsreader", "serif"],
        sans: ["Inter Tight", "sans-serif"],
      },
      fontSize: {
        "step--1": "var(--step--1)",
        "step-0": "var(--step-0)",
        "step-1": "var(--step-1)",
        "step-2": "var(--step-2)",
        "step-3": "var(--step-3)",
        "step-4": "var(--step-4)",
        "step-5": "var(--step-5)",
        "step-6": "var(--step-6)",
        "step-7": "var(--step-7)",
      },
      spacing: {
        "sp-xs": "var(--sp-xs)",
        "sp-sm": "var(--sp-sm)",
        "sp-md": "var(--sp-md)",
        "sp-lg": "var(--sp-lg)",
        "sp-xl": "var(--sp-xl)",
        "sp-2xl": "var(--sp-2xl)",
        "sp-3xl": "var(--sp-3xl)",
      },
    },
  },
  plugins: [],
} satisfies Config;
