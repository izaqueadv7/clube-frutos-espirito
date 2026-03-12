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
          DEFAULT: "#C1121F",
          dark: "#8B0E17",
          light: "#E86A73"
        },
        accent: {
          DEFAULT: "#F2C94C",
          dark: "#D6A825",
          light: "#FFE59A"
        },
        surface: "#FFF8EF",
        ink: "#222222"
      },
      boxShadow: {
        card: "0 10px 30px rgba(193,18,31,0.12)"
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(circle at top right, rgba(242,201,76,0.35), transparent 38%), linear-gradient(130deg, #fff8ef, #fff)"
      }
    }
  },
  plugins: []
};

export default config;
