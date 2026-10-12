/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: { sans: ['"Times New Roman"', 'Times', 'serif'], serif: ['"Times New Roman"', 'Times', 'serif'] },
    fontSize: {
      xs: ['12px', '1.6'], sm: ['12px', '1.6'], base: ['12px', '1.6'],
      lg: ['16px', '1.5'], xl: ['16px', '1.5'],
      '2xl': ['20px', '1.4'], '3xl': ['20px', '1.4'], '4xl': ['20px', '1.4'],
      '5xl': ['20px', '1.4'], '6xl': ['20px', '1.4'], '7xl': ['20px', '1.4'],
      '8xl': ['20px', '1.4'], '9xl': ['20px', '1.4'],
    },
    extend: {},
  },
  plugins: [],
}

