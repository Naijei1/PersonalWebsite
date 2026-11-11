/** Tokens live in src/index.css. Tailwind only points at them. */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ground: 'var(--ground)',
        ink: 'var(--ink)',
        mute: 'var(--mute)',
        tape: 'var(--tape)',
        'tape-ink': 'var(--tape-ink)',
        line: 'var(--line)',
        plate: 'var(--plate)',
        paper: 'var(--paper)',
      },
      fontFamily: {
        sans: ['"Pathway Extreme Variable"', 'sans-serif'],
      },
      letterSpacing: {
        sign: '-0.035em',
      },
      maxWidth: {
        measure: '68ch',
        page: '76rem',
      },
      borderRadius: {
        stage: '1.25rem',
        phone: '1.75rem',
      },
    },
  },
  plugins: [],
}
