import { readFileSync } from 'node:fs'
import { reactRouter } from '@react-router/dev/vite'
import { defineConfig, type Plugin } from 'vite'

const crossOriginIsolation = {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
}

const woff2Only = (): Plugin => ({
  name: 'woff2-only',
  enforce: 'pre',
  transform(code, id) {
    if (!id.includes('@fontsource') || !id.endsWith('.css')) return
    return code.replace(/,\s*url\([^)]*\.woff\) format\('woff'\)/g, '')
  },
})

const compactJoseki = (): Plugin => ({
  name: 'compact-joseki',
  enforce: 'pre',
  load(id) {
    if (!/joseki[\\/][^?]+\.json\?raw$/.test(id)) return
    return `export default ${JSON.stringify(JSON.stringify(JSON.parse(readFileSync(id.slice(0, -4), 'utf8'))))}`
  },
})

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [compactJoseki(), woff2Only(), reactRouter()],
  build: {
    chunkSizeWarningLimit: 1500,
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: 'three', test: /node_modules[\\/]three/ },
            { name: 'shogi', test: /node_modules[\\/]tsshogi/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
  server: { headers: crossOriginIsolation },
  preview: { headers: crossOriginIsolation },
})
