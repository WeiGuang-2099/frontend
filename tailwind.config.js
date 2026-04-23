/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cosmic colors
        'cosmic-blue': '#00D9FF',
        'cosmic-purple': '#7B68EE',
        // Background colors
        'bg-primary': '#0A1628',
        'bg-secondary': '#1A1A2E',
        'bg-tertiary': '#16213E',
        // Accent colors
        'accent-primary': '#00D9FF',
        'accent-secondary': '#7B68EE',
        // Text colors
        'text-primary': '#F5F5F5',
        'text-secondary': '#B8BCC8',
        'text-muted': '#6C7293',
        // Status colors
        'success': '#00F5A0',
        'warning': '#F7B731',
        'error': '#EE5A6F',
        'info': '#4FACFE',
        // Border colors
        'border-default': 'rgba(255, 255, 255, 0.1)',
        'border-hover': 'rgba(255, 255, 255, 0.2)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%)',
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'float-reverse': 'float-reverse 15s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(30px, -30px) scale(1.1)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-30px, 30px) scale(1.1)' },
        },
      },
    },
  },
  plugins: [],
}
