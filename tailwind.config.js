/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        panel: "0 18px 45px rgba(20, 37, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
