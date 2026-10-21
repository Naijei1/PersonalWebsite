import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    // The lazily loaded Three.js chunk is large (~225 kB gzip) and only loads when a showcase is on screen.
    chunkSizeWarningLimit: 900,
  },
})
