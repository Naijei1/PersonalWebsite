import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/collector/browser.ts',
      formats: ['es'],
      fileName: 'collect',
    },
    outDir: 'dist/collector',
    emptyOutDir: true,
  },
})
