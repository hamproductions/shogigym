import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const crossOriginIsolation = {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
}

export default defineConfig({
  plugins: [react()],
  server: { headers: crossOriginIsolation },
  preview: { headers: crossOriginIsolation },
})
