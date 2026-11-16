// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    { pattern: /bg-(blue|green|yellow|purple|red|pink|indigo)-(100|500|600)/ },
    { pattern: /text-(blue|green|yellow|purple|red|pink|indigo)-(100|500|600)/ },
  ],
  theme: { /* ... */ },
};