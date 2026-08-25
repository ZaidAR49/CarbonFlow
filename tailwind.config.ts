import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F172A",
        "background-alt": "#022C22",
        "emerald-neon": "#10B981",
        "emerald-deep": "#059669",
        "emerald-dim": "#065F46",
        "slate-muted": "#334155",
        "slate-border": "#1E293B",
        "text-primary": "#F8FAFC",
        "text-secondary": "#94A3B8",
        "text-accent": "#34D399",
        "amber-scope1": "#F59E0B",
        "red-error": "#EF4444",
        "green-success": "#22C55E",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        arabic: ["var(--font-cairo)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #0F172A 0%, #022C22 50%, #0F172A 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(5,150,105,0.02) 100%)",
        "emerald-glow": "radial-gradient(ellipse at center, rgba(16,185,129,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        "emerald-glow": "0 0 20px rgba(16,185,129,0.3), 0 0 40px rgba(16,185,129,0.1)",
        "emerald-sm": "0 0 10px rgba(16,185,129,0.2)",
        card: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      animation: {
        "pulse-emerald": "pulseEmerald 2s ease-in-out infinite",
        "spin-slow": "spin 4s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "particle": "particle 2s ease-in-out infinite",
        "scan": "scan 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        pulseEmerald: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(16,185,129,0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(16,185,129,0.7), 0 0 60px rgba(16,185,129,0.3)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
