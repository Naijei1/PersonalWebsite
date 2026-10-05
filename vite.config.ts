import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    // The lazily loaded Three.js chunk is ~830 kB raw (~225 kB gzip) and only loads on desktop.
    chunkSizeWarningLimit: 900,
  },
})
