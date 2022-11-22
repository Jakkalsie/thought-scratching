/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        light: "#e5e6ed",
        dark: "#5c626e",
        primary: "#131313",
        secondary: "#afb0b5",
        accent: "#e66f98"
      },
      maxWidth: {
        "8xl": "90rem"
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
