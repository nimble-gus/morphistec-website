/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx,js,jsx,mdx}',
    './src/components/**/*.{ts,tsx,js,jsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        ok: {
          black: "oklch(0.24 0.005 260 / <alpha-value>)",
          ink: "oklch(0.2 0.005 260 / <alpha-value>)",
          card: "oklch(0.28 0.01 260 / <alpha-value>)",
          carbon: "oklch(0.24 0.005 260 / <alpha-value>)",
          graphite: "oklch(0.28 0.01 260 / <alpha-value>)",
          bone: "oklch(0.98 0.006 260 / <alpha-value>)",
          indigo: "oklch(0.55 0.2 265 / <alpha-value>)",
          amber: "oklch(0.78 0.16 70 / <alpha-value>)",
          neon: "oklch(0.55 0.2 265 / <alpha-value>)",
          accent: "oklch(0.55 0.2 265 / <alpha-value>)",
          emphasis: "oklch(0.78 0.16 70 / <alpha-value>)",
          line: "rgba(255,255,255,0.08)",
          "line-2": "rgba(255,255,255,0.14)",
          text: "#ededed",
          mute: "#8a8a8a",
          dim: "#5a5a5a",
          blue: "oklch(0.55 0.2 265 / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia"],
        script: ["var(--font-script)", "cursive"],
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0)" },
        },
        "float-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        marquee: "marquee 42s linear infinite",
        "marquee-reverse": "marquee-reverse 48s linear infinite",
        "float-in": "float-in .8s cubic-bezier(.2,.7,.2,1) both",
        "spin-slow": "spin-slow 60s linear infinite",
      },
    },
  },
  plugins: [],
};
