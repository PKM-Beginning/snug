import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" } },
    extend: {
      colors: {
        navy: {
          950: "#06112B",
          900: "#0B1B3F",
          800: "#13285A",
          700: "#1D3A76",
          600: "#2C4E92",
        },
        ice: {
          50: "#F5F9FE",
          100: "#E8F1FB",
          200: "#D3E4F7",
          300: "#A9C9EE",
          400: "#6FA8DC",
          500: "#3F86C9",
        },
        lavender: {
          50: "#F7F5FE",
          100: "#EDE9FC",
          200: "#DCD3F8",
          300: "#C2B4F0",
          400: "#A08CF5",
          500: "#7C5CF0",
          600: "#6646E0",
        },
        ember: {
          50: "#FFF4EF",
          100: "#FFE3D7",
          500: "#F26B3A",
          600: "#DE5522",
          700: "#B8431A",
        },
      },
      backgroundImage: {
        "cta-gradient": "linear-gradient(90deg, #3F6FF0 0%, #7C5CF0 100%)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,27,63,0.04), 0 4px 16px rgba(11,27,63,0.06)",
        lift: "0 2px 4px rgba(11,27,63,0.05), 0 12px 32px rgba(11,27,63,0.10)",
        glass: "0 1px 0 rgba(255,255,255,0.7) inset, 0 8px 32px rgba(40,52,120,0.10)",
        cta: "0 8px 24px -6px rgba(102,70,224,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
