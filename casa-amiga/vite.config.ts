import { defineConfig } from 'vite';
// assets/ se sirve en la raíz: /img, /fotos, /gen (config y cuadros de video generados por tools/build.mjs)
export default defineConfig({
  publicDir: 'assets',
  build: { outDir: 'dist', target: 'es2022', assetsInlineLimit: 0, sourcemap: false, copyPublicDir: false },
  server: { port: 5173, host: true },
});
