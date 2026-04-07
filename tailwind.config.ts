import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        surface: "var(--color-surface)",
        line: "var(--color-line)",
        brand: "var(--color-brand)",
        green: "var(--color-green)",
        accent: "var(--color-accent)",
        bg: "var(--color-bg)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)"
      },
      borderRadius: {
        xl2: "1.5rem"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(16, 24, 40, 0.08)",
        card: "0 6px 18px rgba(16, 24, 40, 0.06)"
      },
      fontFamily: {
        sans: ["var(--font-manrope)"],
        serif: ["var(--font-newsreader)"]
      }
    }
  },
  plugins: []
};

export default config;
