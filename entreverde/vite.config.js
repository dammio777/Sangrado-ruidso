import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ruta = (p) => fileURLToPath(new URL(p, import.meta.url));

/* Modos:
   - normal (npm run build)            → dist/: sitio estático con /fotos y srcset.
   - artifact (npm run build:artifact) → dist-artifact/: versión para el visor de artefactos.
   - single (npm run build:single)     → dist-single/index.html: UN solo archivo con todo adentro. */
export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  return {
    base: './',
    publicDir: single ? false : 'public',
    resolve: {
      alias: { '@fotos-inline': ruta(single ? './src/lib/fotos-inline.single.js' : './src/lib/fotos-inline.empty.js') },
    },
    plugins: [
      react(),
      tailwindcss(),
      single && {
        name: 'entreverde-un-archivo',
        // Solo woff2 (todos los navegadores actuales lo soportan): evita incrustar cada fuente dos veces.
        transform(code, id) {
          if (id.includes('@fontsource') && id.endsWith('.css')) return code.replace(/,\s*url\([^)]*\.woff\)\s*format\('woff'\)/g, '');
        },
        transformIndexHtml(html) {
          const favicon = 'data:image/svg+xml;base64,' + readFileSync(ruta('./public/favicon.svg')).toString('base64');
          return html
            .replace(/\s*<link rel="preload" as="image"[^>]*>/, '')
            .replace(/\s*<meta property="og:image(:alt)?"[^>]*>/g, '')
            .replace(/\s*"image": "[^"]*",/, '')
            .replace(/\s*"logo": "[^"]*",/, '')
            .replace('href="./favicon.svg"', `href="${favicon}"`);
        },
      },
      single && viteSingleFile({ removeViteModuleLoader: true }),
    ].filter(Boolean),
    build: {
      outDir: mode === 'artifact' ? 'dist-artifact' : single ? 'dist-single' : 'dist',
      assetsInlineLimit: single ? 100_000_000 : 0,
      cssCodeSplit: false,
      chunkSizeWarningLimit: single ? 10_000 : 700,
    },
  };
});
