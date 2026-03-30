import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2E7D32",
          dark: "#1B5E20",
          light: "#66BB6A"
        },
        accent: {
          DEFAULT: "#FFFFFF",
          dark: "#0F172A",
          light: "#F5FAF5"
        },
        surface: "#F5FAF5",
        ink: "#111827"
      },
      boxShadow: {
        card: "0 10px 30px rgba(27,94,32,0.12)"
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(circle at top right, rgba(102,187,106,0.18), transparent 38%), linear-gradient(130deg, #f5faf5, #ffffff)"
      }
    }
  },
  plugins: []
};

export default config;