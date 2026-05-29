import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 28px 80px rgba(0,0,0,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
