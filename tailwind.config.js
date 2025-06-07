/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#d4af37",
        secondary: "#b8860b",
        accent: "#00ffff",
        // MUD-style game colors
        mud: {
          bg: "#1a1a1a",
          panel: "#2a2a2a",
          border: "#404040",
          text: "#e0e0e0",
          muted: "#888888",
          success: "#d4af37",
          warning: "#ffaa00",
          danger: "#ff4444",
          info: "#0088ff",
          magic: "#aa00ff"
        },
        // Flat status colors
        status: {
          hp: "#e53e3e",
          stamina: "#38a169",
          hunger: "#d69e2e",
          thirst: "#3182ce",
          mana: "#805ad5"
        },
        action: {
          friendly: "#4CAF50",
          romantic: "#E91E63",
          funny: "#FF9800",
          mean: "#F44336",
          personal: "#2196F3",
          activity: "#9C27B0",
        },
        avatar: {
          DEFAULT: "#f0f4f8",
          primary: "#1d4ed8",
          secondary: "#64748b",
        },
      },
      fontFamily: {
        mono: ["'Courier New'", "monospace"],
        game: ["'Consolas'", "'Monaco'", "monospace"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        blink: {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
        "progress-fill": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        blink: "blink 1s infinite",
        "progress-fill": "progress-fill 0.5s ease-out",
      },
      spacing: {
        128: "32rem",
        144: "36rem",
        160: "40rem",
      },
      borderRadius: {
        xl: "1rem",
      },
      backgroundColor: {
        dropdown: {
          DEFAULT: "#ffffff",
          hover: "#f3f4f6",
          selected: "#e5e7eb",
        },
      },
    },
  },
  plugins: [],
};
