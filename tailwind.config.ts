import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f8f7f4",
        foreground: "#26252b",
        primary: "#e96345",
        border: "#e9e7e2",
      },
    },
  },
  plugins: [],
} satisfies Config;
