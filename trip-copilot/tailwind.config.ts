import type { Config } from 'tailwindcss';

/**
 * Farebný systém TRIP COPILOT.
 * Vychádza z Jadranu (more), letnej oblohy, piesku a dopravného značenia.
 * Všetky odtiene sú CSS premenné (app/globals.css) => light aj dark mode.
 */
const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        raised: 'rgb(var(--c-raised) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        sea: 'rgb(var(--c-sea) / <alpha-value>)',
        lagoon: 'rgb(var(--c-lagoon) / <alpha-value>)',
        sand: 'rgb(var(--c-sand) / <alpha-value>)',
        signal: 'rgb(var(--c-signal) / <alpha-value>)',
        danger: 'rgb(var(--c-danger) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-barlow)', 'system-ui', 'sans-serif'],
        condensed: ['var(--font-barlow-condensed)', 'var(--font-barlow)', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgb(8 24 31 / 0.06), 0 8px 24px -12px rgb(8 24 31 / 0.25)',
        lift: '0 12px 32px -16px rgb(8 24 31 / 0.45)',
      },
      spacing: {
        nav: '76px',
      },
    },
  },
  plugins: [],
};

export default config;
