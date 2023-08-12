/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        'black-rgba': 'rgba(22 22 22 0.7)',
        bgsign:"#000000d9",
      }
    },
  },
  plugins: [],
};
