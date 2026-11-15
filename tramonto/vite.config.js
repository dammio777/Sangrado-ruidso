import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base './' → el build funciona en cualquier subcarpeta (GitHub Pages, hosting estático, etc.)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: { outDir: 'dist', assetsInlineLimit: 0, chunkSizeWarningLimit: 800 },
});
