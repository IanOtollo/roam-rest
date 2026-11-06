import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: "hsl(var(--card))",
        border: "hsl(var(--border))",
        night: "hsl(var(--night))",
        "on-night": "hsl(var(--on-night))",
        sea: "hsl(var(--sea))",
      },
      borderRadius: {
        xl: "var(--radius)",
        "2xl": "calc(var(--radius) + 0.5rem)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
