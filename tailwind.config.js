/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xs': ['13px', { lineHeight: '19px' }],
        'sm': ['15px', { lineHeight: '23px' }],
        'base': ['17px', { lineHeight: '27px' }],
        'lg': ['19px', { lineHeight: '29px' }],
        'xl': ['21px', { lineHeight: '31px' }],
        '2xl': ['25px', { lineHeight: '35px' }],
        '3xl': ['31px', { lineHeight: '39px' }],
        '4xl': ['37px', { lineHeight: '43px' }],
        '5xl': ['49px', { lineHeight: '1.1' }],
      },
      colors: {
        quake: {
          50: '#f0fdf4',
          500: '#10b981',
          600: '#059669',
          900: '#064e3b',
        },
        cyber: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          accent: '#6366f1',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounce 0.6s ease-in-out 2',
      }
    },
  },
  plugins: [],
}
