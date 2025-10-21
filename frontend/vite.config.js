import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const appDir = path.resolve(__dirname, 'apps/app-client')

export default defineConfig({
  root: appDir,
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@': path.resolve(appDir, 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  server: {
    host: true,
    port: 3000,
    open: true,
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/app-client'),
    emptyOutDir: true,
  },
})
