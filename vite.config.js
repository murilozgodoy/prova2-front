import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

// Em desenvolvimento, /api vai para o back (igual ao rewrite da Vercel em producao).
// Por padrao, o back local; para usar o da AWS:
//   API_TARGET=http://3.235.6.136:8080 npm run dev
const API_TARGET = process.env.API_TARGET || 'http://localhost:8080'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
