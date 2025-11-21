/** @type {import('tailwindcss').Config} */
module.exports = {
  // @ts-expect-error - nativewind/preset is not typed
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
