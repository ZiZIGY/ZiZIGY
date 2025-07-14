import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#8a2be2',
        'primary-light': '#af69ef',
        'primary-dark': '#5d1c9c',
        secondary: '#42b883',
        'secondary-light': '#6fcba0',
        'secondary-dark': '#2d805b',
        dark: '#121212',
        'dark-surface': '#1e1e1e',
        'dark-lighter': '#2a2a2a',
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        float: 'float 6s ease-in-out infinite',
        glow: 'glow var(--duration, 10s) ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { backgroundPosition: '0% 0%' },
          '25%': { backgroundPosition: '100% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
          '75%': { backgroundPosition: '0% 100%' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
