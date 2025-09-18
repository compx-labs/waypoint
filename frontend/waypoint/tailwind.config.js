/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Bangers", "Fredoka One", "cursive"],
        sans: ["Inter", "Nunito", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          "Space Mono",
          "ui-monospace", 
          "SFMono-Regular",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      colors: {
        // Adventure Color Palette
        primary: {
          50: "#FFF9E6",   // Warm Off-White (parchment)
          100: "#FAE5B3",  // Sandstone Beige
          200: "#F5D982",
          300: "#F0CD51",
          400: "#EBC120",
          500: "#D4A017",  // Golden
          600: "#B8890F",
          700: "#9C7207",
          800: "#805B00",
          900: "#644400",
          950: "#3D2A00",
        },
        forest: {
          50: "#F0F4F0",
          100: "#D9E5DA",
          200: "#B3CDB5",
          300: "#8DB590",
          400: "#679D6B",
          500: "#264027",  // Deep Forest Green
          600: "#1F3320",
          700: "#182619",
          800: "#111A12",
          900: "#0A0D0B",
          950: "#030403",
        },
        sunset: {
          50: "#FFF4F0",
          100: "#FFE4D6",
          200: "#FFC9AD",
          300: "#FFAE84",
          400: "#FF935B",
          500: "#F28444",  // Sunset Orange
          600: "#E06B2A",
          700: "#CE5210",
          800: "#A64208",
          900: "#7E3206",
          950: "#4F1F04",
        },
        coral: {
          50: "#FFF5F5",
          100: "#FFE3E3",
          200: "#FFCCCC",
          300: "#FFB3B3",
          400: "#FF9999",
          500: "#FF6B6B",  // Coral Red
          600: "#E55555",
          700: "#CC4444",
          800: "#B33333",
          900: "#992222",
          950: "#661111",
        },
        sky: {
          50: "#F0F8FF",
          100: "#E0F0FF",
          200: "#C1E1FF",
          300: "#A2D2FF",
          400: "#83C3FF",
          500: "#669BBC",  // Sky Blue
          600: "#4A7A99",
          700: "#2E5976",
          800: "#123853",
          900: "#001730",
          950: "#00081A",
        },
        stone: {
          50: "#F5F5F5",
          100: "#EBEBEB",
          200: "#D7D7D7",
          300: "#C3C3C3",
          400: "#AFAFAF",
          500: "#3D3D3D",  // Rocky Grey
          600: "#333333",
          700: "#292929",
          800: "#1F1F1F",
          900: "#151515",
          950: "#0B0B0B",
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "trail-draw": "trailDraw 4s ease-in-out infinite",
        "flag-wave": "flagWave 3s ease-in-out infinite",
        "compass-spin": "compassSpin 8s linear infinite",
        "marker-pop": "markerPop 0.6s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        pulseGlow: {
          "0%, 100%": {
            filter: "brightness(1) drop-shadow(0 0 5px rgba(242, 132, 68, 0.7))",
          },
          "50%": {
            filter: "brightness(1.3) drop-shadow(0 0 15px rgba(242, 132, 68, 0.9))",
          },
        },
        trailDraw: {
          "0%": { "stroke-dashoffset": "100%" },
          "100%": { "stroke-dashoffset": "0%" },
        },
        flagWave: {
          "0%, 100%": { transform: "rotate(0deg) scaleX(1)" },
          "50%": { transform: "rotate(2deg) scaleX(1.05)" },
        },
        compassSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        markerPop: {
          "0%": { transform: "scale(0) rotate(-180deg)", opacity: "0" },
          "50%": { transform: "scale(1.2) rotate(-90deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
      },
      backgroundImage: {
        "adventure-gradient": "linear-gradient(135deg, #264027 0%, #F28444 50%, #FAE5B3 100%)",
        "sunset-gradient": "linear-gradient(135deg, #F28444 0%, #FF935B 100%)",
        "parchment-gradient": "linear-gradient(180deg, #FFF9E6 0%, #FAE5B3 100%)",
        "forest-gradient": "linear-gradient(135deg, #264027 0%, #679D6B 100%)",
        "map-pattern": 
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23264027' stroke-opacity='0.1' stroke-width='1'%3E%3Cpath d='M10 10l40 40M50 10L10 50M30 0v60M0 30h60'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        "trail-pattern":
          "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23F28444' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
        "parchment-texture":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        // Adventure themed shadows
        "sunset-glow": "0 0 10px rgba(242, 132, 68, 0.5), 0 0 20px rgba(242, 132, 68, 0.3)",
        "sunset-hover": "0 0 15px rgba(242, 132, 68, 0.7), 0 0 30px rgba(242, 132, 68, 0.5)",
        "coral-glow": "0 0 10px rgba(255, 107, 107, 0.5), 0 0 20px rgba(255, 107, 107, 0.3)",
        "forest-glow": "0 0 8px rgba(38, 64, 39, 0.6), 0 0 16px rgba(38, 64, 39, 0.4)",
        
        // Adventure depth shadows
        "adventure-depth": "0 8px 24px rgba(38, 64, 39, 0.25)",
        "adventure-hover": "0 12px 32px rgba(38, 64, 39, 0.3)",
        "marker": "0 4px 12px rgba(242, 132, 68, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)",
        "trail": "0 2px 8px rgba(102, 155, 188, 0.2)",
        
        // Button shadows
        "button-sunset": "0 4px 12px rgba(242, 132, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
        "button-coral": "0 4px 12px rgba(255, 107, 107, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        "button-forest": "0 4px 12px rgba(38, 64, 39, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        
        // Card shadows
        "card-parchment": "0 6px 20px rgba(38, 64, 39, 0.15), 0 2px 4px rgba(38, 64, 39, 0.1)",
        "card-hover": "0 10px 30px rgba(38, 64, 39, 0.2), 0 4px 8px rgba(38, 64, 39, 0.15)",
        "map-shadow": "0 8px 25px rgba(61, 61, 61, 0.2), 0 3px 6px rgba(61, 61, 61, 0.1)",
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      // Adventure utility classes
      const adventureUtilities = {
        ".btn-sunset": {
          background: "linear-gradient(135deg, #F28444 0%, #FF935B 100%)",
          color: "#FFF9E6",
          "font-weight": "700",
          padding: "14px 28px",
          "border-radius": "12px",
          "box-shadow": "0 4px 12px rgba(242, 132, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          transition: "all 200ms ease-out",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          "&:hover": {
            transform: "translateY(-3px) scale(1.02)",
            "box-shadow": "0 8px 25px rgba(242, 132, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
          },
          "&:active": {
            transform: "translateY(-1px) scale(0.98)",
          },
        },
        ".btn-coral": {
          background: "transparent",
          color: "#FF6B6B",
          "font-weight": "600", 
          padding: "14px 28px",
          "border-radius": "12px",
          border: "2px solid #FF6B6B",
          "box-shadow": "0 2px 8px rgba(255, 107, 107, 0.2)",
          transition: "all 200ms ease-out",
          "&:hover": {
            background: "#FF6B6B",
            color: "#FFF9E6",
            transform: "translateY(-2px) scale(1.02)",
            "box-shadow": "0 6px 20px rgba(255, 107, 107, 0.4)",
          },
        },
        ".card-adventure": {
          background: "linear-gradient(135deg, #264027 0%, #679D6B 50%, #FAE5B3 100%)",
          color: "#FFF9E6",
          "border-radius": "16px",
          "box-shadow": "0 6px 20px rgba(38, 64, 39, 0.15), 0 2px 4px rgba(38, 64, 39, 0.1)",
          padding: "1.5rem",
          border: "2px solid rgba(242, 132, 68, 0.2)",
          transition: "all 200ms ease-out",
          "&:hover": {
            transform: "translateY(-4px) rotate(0.5deg)",
            "box-shadow": "0 12px 35px rgba(38, 64, 39, 0.2), 0 4px 8px rgba(38, 64, 39, 0.15)",
          },
        },
        ".card-parchment": {
          background: "#FFF9E6",
          color: "#264027",
          "border-radius": "16px",
          "box-shadow": "0 6px 20px rgba(38, 64, 39, 0.1), 0 2px 4px rgba(38, 64, 39, 0.05)",
          border: "2px dashed rgba(242, 132, 68, 0.3)",
          padding: "1.5rem",
          transition: "all 200ms ease-out",
          "&:hover": {
            transform: "translateY(-2px)",
            "box-shadow": "0 8px 25px rgba(38, 64, 39, 0.15), 0 3px 6px rgba(38, 64, 39, 0.1)",
          },
        },
        ".trail-divider": {
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "60px",
            background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 1200 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,60 Q300,20 600,60 T1200,60 L1200,120 L0,120 Z' fill='%23FFF9E6'/%3E%3C/svg%3E\")",
            "background-size": "cover",
          },
        },
        ".dotted-trail": {
          "border-style": "dashed",
          "border-width": "2px",
          "border-color": "#F28444",
          "border-spacing": "8px",
        },
      };
      addUtilities(adventureUtilities);
    },
  ],
};


