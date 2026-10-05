/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Google Sans"', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['"Google Sans Code"', '"JetBrains Mono"', 'monospace'],
        hand: ['Caveat', 'cursive'],
      },
      colors: {
        g: {
          blue: '#4285F4',
          'blue-ink': '#1A73E8',
          red: '#EA4335',
          yellow: '#FBBC04',
          green: '#34A853',
        },
        ink: {
          DEFAULT: '#202124',
          soft: '#5F6368',
          faint: '#80868B',
        },
        night: {
          DEFAULT: '#1F1F1F',
          raised: '#28292A',
          line: '#3C4043',
          text: '#E8EAED',
          soft: '#9AA0A6',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(60,64,67,.12), 0 2px 6px 2px rgba(60,64,67,.08)',
        lift: '0 1px 3px rgba(60,64,67,.16), 0 8px 24px 4px rgba(60,64,67,.12)',
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        hop: {
          '0%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-14px) rotate(-6deg)' },
          '70%': { transform: 'translateY(2px)' },
        },
        fall: {
          '0%': { transform: 'translateY(0) rotate(0)' },
          '55%': { transform: 'translateY(var(--fall, 60vh)) rotate(var(--spin, 40deg))' },
          '75%': { transform: 'translateY(var(--fall, 60vh)) rotate(var(--spin, 40deg))' },
          '100%': { transform: 'translateY(0) rotate(0)' },
        },
        roll: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        rise: 'rise .7s cubic-bezier(.2,.8,.2,1) both',
        hop: 'hop .6s cubic-bezier(.3,1.4,.5,1)',
        fall: 'fall 2.6s cubic-bezier(.5,0,.5,1) both',
        roll: 'roll 1.2s cubic-bezier(.45,.05,.35,1)',
      },
    },
  },
  plugins: [],
}
