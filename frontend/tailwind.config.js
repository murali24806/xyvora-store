/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // These map to CSS variables set at runtime from the admin's theme settings
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        bg: 'var(--color-background)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-text)',
        headerBg: 'var(--color-headerBg)',
        headerText: 'var(--color-headerText)',
        footerBg: 'var(--color-footerBg)',
        footerText: 'var(--color-footerText)',
      },
      fontFamily: {
        display: ['Anton', 'Helvetica Neue', 'Arial', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
