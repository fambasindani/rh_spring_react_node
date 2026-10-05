import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/rh/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  define: {
    global: 'globalThis',
    'global.Buffer': ['buffer', 'Buffer'],
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
})
