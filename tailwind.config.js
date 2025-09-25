/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        umn: {
          maroon: "#7a0019",
          gold: "#ffcc33",
          gray0: "#ffffff",
          gray1: "#f5f5f5",
          gray2: "#ececec",
          gray3: "#d9d9d9",
          gray4: "#9aa0a6",
          text: "#2b2b2b",
        },
      },
      boxShadow: {
        card: "0 1px 0 rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)",
      },
      fontSize: {
        h1: ["2.25rem", { lineHeight: "2.5rem", fontWeight: "700" }],
        h2: ["1.5rem", { lineHeight: "2rem", fontWeight: "700" }],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};