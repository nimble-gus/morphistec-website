/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx,js,jsx,mdx}',
    './src/components/**/*.{ts,tsx,js,jsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ok: {
          black: '#050505',
          ink: '#0a0a0a',
          card: '#0f0f10',
          line: 'rgba(255,255,255,0.08)',
          'line-2': 'rgba(255,255,255,0.14)',
          text: '#ededed',
          mute: '#8a8a8a',
          dim: '#5a5a5a',
          neon: '#b8ff2e',
          blue: '#2b6bff',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-mono)', 'ui-monospace'],
        serif: ['var(--font-serif)', 'ui-serif', 'Georgia'],
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-33.333%)' },
        },
        'float-in': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'float-in': 'float-in .8s cubic-bezier(.2,.7,.2,1) both',
        'spin-slow': 'spin-slow 60s linear infinite',
      },
    },
  },
  plugins: [],
};
