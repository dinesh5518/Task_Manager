import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      sonner: path.resolve(__dirname, 'node_modules/sonner/dist/index.mjs'),
    },
  },
  plugins: [react(), tailwindcss()],
})
