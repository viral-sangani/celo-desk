import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', "monospace"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        terminal: {
          black: "#0a0a0a",
          border: "#2a2a2a",
          amber: "#ffb400",
          green: "#00ff41",
          red: "#ff3131",
          text: "#d1d5db",
        },
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        modalIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        modalOut: {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.97)" },
        },
        backdropIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "modal-in": "modalIn 150ms cubic-bezier(0.23, 1, 0.32, 1)",
        "modal-out": "modalOut 100ms cubic-bezier(0.23, 1, 0.32, 1)",
        "backdrop-in": "backdropIn 150ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
