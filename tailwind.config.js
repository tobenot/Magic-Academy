/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FFD700",
        secondary: "#DAA520",
        action: {
          friendly: "#4CAF50",
          romantic: "#E91E63",
          funny: "#FF9800",
          mean: "#F44336",
          personal: "#2196F3",
          activity: "#9C27B0",
        },
      },
      fontFamily: {
        cinzel: ["Cinzel", "serif"],
        "noto-serif": ['"Noto Serif SC"', "serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "rotate-in": {
          "0%": {
            opacity: "0",
            transform: "rotate(-180deg) scale(0.3)",
          },
          "100%": {
            opacity: "1",
            transform: "rotate(0) scale(1)",
          },
        },
        progress: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        "action-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "action-complete": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        "progress-glow": {
          "0%": {
            "box-shadow": "0 0 5px var(--action-color)",
            opacity: "0.8",
          },
          "50%": {
            "box-shadow": "0 0 15px var(--action-color)",
            opacity: "1",
          },
          "100%": {
            "box-shadow": "0 0 5px var(--action-color)",
            opacity: "0.8",
          },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "rotate-in": "rotate-in 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        progress: "progress var(--duration) linear forwards",
        "action-pulse": "action-pulse 2s ease-in-out infinite",
        "action-complete": "action-complete 0.5s ease-out",
        "progress-glow": "progress-glow 2s ease-in-out infinite",
      },
      boxShadow: {
        action: "0 0 10px var(--action-color)",
      },
      backgroundImage: {
        "action-gradient":
          "linear-gradient(45deg, var(--action-from), var(--action-to))",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".action-active": {
          "--action-opacity": "1",
          "--action-scale": "1",
          transition: "all 0.3s ease",
        },
        ".action-completed": {
          "--action-opacity": "0.7",
          "--action-scale": "0.98",
          transition: "all 0.3s ease",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
