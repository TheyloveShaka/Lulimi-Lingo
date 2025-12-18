import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Lulimi-Lingo/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist'
  }
})
