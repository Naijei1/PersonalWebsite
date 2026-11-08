/** Tokens mirror the public site's tailwind.config.js so this app can be hosted on its own. */
export default {
  content: ['./index.html', './src/client/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Google Sans"', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['"Google Sans Code"', '"JetBrains Mono"', 'monospace'],
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
    },
  },
  plugins: [],
}
