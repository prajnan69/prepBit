import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        'primary-dark': '#4338ca',
        secondary: '#f97316',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      animation: {
        'slow-float': 'float 10s ease-in-out infinite',
        'slow-float-rev': 'float-reverse 12s ease-in-out infinite',
        'pulse-button': 'pulse 2s ease-in-out infinite',
        shake: 'shake 0.4s ease-in-out',
        glow: 'glow 2s ease-in-out infinite alternate',
        // --- ADD THIS NEW ANIMATION ---
        'subtle-glow-shadow': 'subtle-glow-shadow 6s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(20px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        glow: {
          '0%': { textShadow: '0 0 5px rgba(79, 70, 229, 0.5)' },
          '100%': { textShadow: '0 0 15px rgba(249, 115, 22, 0.8)' },
        },
        // --- ADD THESE NEW KEYFRAMES ---
        'subtle-glow-shadow': {
          '0%': { boxShadow: '0 10px 40px rgba(79, 70, 229, 0.4)' },
          '100%': { boxShadow: '0 10px 50px rgba(249, 115, 22, 0.3)' },
        },
      },
    },
  },
  plugins: [forms, typography],
};

export default config;
