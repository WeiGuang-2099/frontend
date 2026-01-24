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
        'cosmic-blue': '#00D9FF',
        'cosmic-purple': '#7B68EE',
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
