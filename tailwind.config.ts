import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { colors: { navy: "#0b1f3a", enterprise: "#2364d2" } } },
  plugins: [],
} satisfies Config;
