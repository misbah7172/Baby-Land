import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blush: {
          50: '#fff8f7',
          100: '#fff1ef',
          200: '#ffe0db',
          300: '#f8c1b8',
          400: '#f0a391',
          500: '#ea876e',
          600: '#d96a50',
          700: '#b94e36',
          800: '#8f3c2c',
          900: '#693022'
        },
        oat: '#f8f4ef',
        sand: '#eadfcf',
        rosewood: '#6b3f3a',
        sage: '#a9c5b7'
      },
      boxShadow: {
        soft: '0 20px 60px -30px rgba(107, 63, 58, 0.35)'
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)']
      },
      backgroundImage: {
        'hero-cream': 'radial-gradient(circle at top left, rgba(248, 193, 184, 0.45), transparent 35%), radial-gradient(circle at top right, rgba(169, 197, 183, 0.35), transparent 28%), linear-gradient(180deg, #fffdfb 0%, #f9f3ee 100%)'
      }
    }
  },
  plugins: []
};

export default config;