import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base './' para que el sitio funcione en cualquier carpeta (GitHub Pages, hosting estático, artefacto).
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: mode === 'artifact' ? 'dist-artifact' : 'dist',
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    rollupOptions: { output: { manualChunks: undefined } },
  },
}));
