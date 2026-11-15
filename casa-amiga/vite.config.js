import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' => el sitio funciona en cualquier subcarpeta (GitHub Pages, hosting propio, etc.)
export default defineConfig({ plugins: [react()], base: './' })
