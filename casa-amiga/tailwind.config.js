/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        blanco: '#FFFFFF',
        hueso: '#FBF6EE',
        ambar: { DEFAULT: '#F29021', oscuro: '#B4600E' },
        canela: '#7C2D12',
        tinta: '#2B1A12',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        script: ['Allura', 'cursive'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: { site: '1440px' },
    },
  },
  plugins: [],
}
