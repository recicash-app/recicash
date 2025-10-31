import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const appDir = __dirname

export default defineConfig({
  root: appDir,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(appDir, 'src'),
      '@shared': path.resolve(__dirname, '../..', 'shared'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../../dist/app-client'),
    emptyOutDir: true,
  },
})
