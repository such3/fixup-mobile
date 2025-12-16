/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb", // blue-600
        secondary: "#ffffff",
        background: "#f8fafc", // slate-50
        text: "#0f172a", // slate-900
      },
    },
  },
  plugins: [],
}
