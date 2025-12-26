/** @type {import('tailwindcss').Config} */
export default {
  darkMode: false,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {},
      lineHeight: {
        'invoice-xs': '1.5',     // 9px 字級
        'invoice-sm': '1.45',    // 10-11px 字級
        'invoice-base': '1.4',   // 12-14px 字級
        'invoice-lg': '1.35',    // 16px+ 字級
        'invoice-xl': '1.3',     // 20px+ 字級
      },
    },
  },
  plugins: [],
}


