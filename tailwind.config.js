/** @type {import('tailwindcss').Config} */
module.exports = {
    // 'jit' è ora abilitato per default nelle versioni recenti
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          brand: {
            light: '#32a852', // Colore chiaro del brand
            DEFAULT: '#32a852', // Colore principale del brand
            dark: '#32a852',   // Versione scura del colore del brand
          },
        },
      },
    },
    plugins: [],
  }