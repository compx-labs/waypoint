/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: [
          "JetBrains Mono",
          "Space Mono",
          "Fira Code",
          "ui-monospace", 
          "SFMono-Regular",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
        sans: [
          "JetBrains Mono",
          "Space Mono", 
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
        mono: [
          "JetBrains Mono",
          "Space Mono",
          "Fira Code",
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
        // Adventure Color Palette - Updated to match logo
        primary: {
          50: "#FDF9F0",   // Very light cream
          100: "#F4E8C0",  // Logo cream color
          200: "#F0E0A8",
          300: "#EBD890",
          400: "#E7D078",
          500: "#E2C860",  // Golden cream
          600: "#D4B648",
          700: "#C5A430",
          800: "#B79218",
          900: "#A88000",
          950: "#7A5C00",
        },
        forest: {
          50: "#F0F6F5",
          100: "#D5E8E4", 
          200: "#ABDAD3",
          300: "#81CCC2",
          400: "#57BEB1",
          500: "#035F5A",  // Logo dark teal
          600: "#024E49",
          700: "#023D38",
          750: "#01342F",  // Between 700 and 800 for subtle gradients
          800: "#012C27",
          900: "#001B16",
          950: "#000A05",
        },
        sunset: {
          50: "#FDF5F3",
          100: "#FBEAE6",
          200: "#F8D5CC",
          300: "#F4C0B3",
          400: "#F1AB99",
          500: "#F16145",  // Logo coral-orange
          600: "#E94A2D",
          700: "#D63515",
          800: "#B02811",
          900: "#8A1F0D",
          950: "#64160A",
        },
        coral: {
          50: "#FDF6F5",
          100: "#FCEDEB",
          200: "#F9DBD7",
          300: "#F6C9C3",
          400: "#F3B7AF",
          500: "#F16145",  // Updated to match logo
          600: "#E94A2D", 
          700: "#D63515",
          800: "#B02811",
          900: "#8A1F0D",
          950: "#64160A",
        },
        // New teal color from logo
        teal: {
          50: "#F0F8F7",
          100: "#D5EFEB",
          200: "#ABDED7",
          300: "#81CEC3",
          400: "#57BDAF",
          500: "#3BAC98",  // Logo medium teal
          600: "#2F8A7A",
          700: "#23685C",
          800: "#17463E",
          900: "#0B2420",
          950: "#051210",
        },
        sky: {
          50: "#F0F8F7",
          100: "#D5EFEB",
          200: "#ABDED7", 
          300: "#81CEC3",
          400: "#57BDAF",
          500: "#3BAC98",  // Updated to match teal theme
          600: "#2F8A7A",
          700: "#23685C",
          800: "#17463E",
          900: "#0B2420",
          950: "#051210",
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
        "adventure-gradient": "linear-gradient(135deg, #035F5A 0%, #F16145 50%, #F4E8C0 100%)",
        "sunset-gradient": "linear-gradient(135deg, #F16145 0%, #F1AB99 100%)",
        "parchment-gradient": "linear-gradient(180deg, #FDF9F0 0%, #F4E8C0 100%)",
        "forest-gradient": "linear-gradient(135deg, #035F5A 0%, #3BAC98 100%)",
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
          background: "linear-gradient(135deg, #F16145 0%, #F1AB99 100%)",
          color: "#FDF9F0",
          "font-weight": "700",
          padding: "14px 28px",
          "border-radius": "12px",
          "box-shadow": "0 4px 12px rgba(241, 97, 69, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          transition: "all 200ms ease-out",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          "&:hover": {
            transform: "translateY(-3px) scale(1.02)",
            "box-shadow": "0 8px 25px rgba(241, 97, 69, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
          },
          "&:active": {
            transform: "translateY(-1px) scale(0.98)",
          },
        },
        ".btn-coral": {
          background: "transparent",
          color: "#F16145",
          "font-weight": "600", 
          padding: "14px 28px",
          "border-radius": "12px",
          border: "2px solid #F16145",
          "box-shadow": "0 2px 8px rgba(241, 97, 69, 0.2)",
          transition: "all 200ms ease-out",
          "&:hover": {
            background: "#F16145",
            color: "#FDF9F0",
            transform: "translateY(-2px) scale(1.02)",
            "box-shadow": "0 6px 20px rgba(241, 97, 69, 0.4)",
          },
        },
        ".card-adventure": {
          background: "linear-gradient(135deg, #035F5A 0%, #3BAC98 50%, #F4E8C0 100%)",
          color: "#FDF9F0",
          "border-radius": "16px",
          "box-shadow": "0 6px 20px rgba(3, 95, 90, 0.15), 0 2px 4px rgba(3, 95, 90, 0.1)",
          padding: "1.5rem",
          border: "2px solid rgba(241, 97, 69, 0.2)",
          transition: "all 200ms ease-out",
          "&:hover": {
            transform: "translateY(-4px) rotate(0.5deg)",
            "box-shadow": "0 12px 35px rgba(3, 95, 90, 0.2), 0 4px 8px rgba(3, 95, 90, 0.15)",
          },
        },
        ".card-parchment": {
          background: "#FDF9F0",
          color: "#035F5A",
          "border-radius": "16px",
          "box-shadow": "0 6px 20px rgba(3, 95, 90, 0.1), 0 2px 4px rgba(3, 95, 90, 0.05)",
          border: "2px dashed rgba(241, 97, 69, 0.3)",
          padding: "1.5rem",
          transition: "all 200ms ease-out",
          "&:hover": {
            transform: "translateY(-2px)",
            "box-shadow": "0 8px 25px rgba(3, 95, 90, 0.15), 0 3px 6px rgba(3, 95, 90, 0.1)",
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


