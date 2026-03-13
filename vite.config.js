import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/nvi': {
        target: 'https://vtr.valasztas.hu/ogy2026/data',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/nvi/, ''),
      },
    },
    host: true, // Listen on all addresses, incl. LAN and 127.0.0.1
  },
  preview: {
    proxy: {
      '/api/nvi': {
        target: 'https://vtr.valasztas.hu/ogy2026/data',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/nvi/, ''),
      },
    },
  },
})
