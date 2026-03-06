import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "jeopardy-blue": "#060CE9",
        "jeopardy-dark": "#000B8D",
        "jeopardy-navy": "#00006E",
        "jeopardy-gold": "#FFCC00",
        "jeopardy-gold-light": "#FFD633",
        "correct": "#22C55E",
        "incorrect": "#EF4444",
        "buzz-red": "#DC2626",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
        pulse_glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255,0,0,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(255,0,0,0.6)" },
        },
      },
      animation: {
        shake: "shake 0.5s ease-in-out",
        "pulse-glow": "pulse_glow 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
