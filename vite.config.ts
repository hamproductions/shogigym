import { readFileSync, realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import pandacss from '@pandacss/vite'
import { reactRouter } from '@react-router/dev/vite'
import { defineConfig, type Plugin } from 'vite'

const crossOriginIsolation = {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
}

const isolationHeaders = (): Plugin => ({
  name: 'cross-origin-isolation',
  enforce: 'pre',
  configureServer(server) {
    server.middlewares.use((_request, response, next) => {
      for (const [name, value] of Object.entries(crossOriginIsolation)) response.setHeader(name, value)
      next()
    })
  },
})

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
  resolve: {
    dedupe: ['three'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'styled-system': fileURLToPath(new URL('./styled-system', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: [
      '@ark-ui/react',
      '@ark-ui/react/anatomy',
      '@ark-ui/react/checkbox',
      '@ark-ui/react/collection',
      '@ark-ui/react/dialog',
      '@ark-ui/react/factory',
      '@ark-ui/react/field',
      '@ark-ui/react/file-upload',
      '@ark-ui/react/locale',
      '@ark-ui/react/portal',
      '@ark-ui/react/segment-group',
      '@ark-ui/react/select',
      '@ark-ui/react/slider',
      '@ark-ui/react/switch',
      '@ark-ui/react/tabs',
      '@ark-ui/react/utils',
      '@dimforge/rapier3d-compat',
      '@pixiv/three-vrm',
      'i18next',
      'react',
      'react-dom',
      'react-dom/client',
      'react-i18next',
      'react-router',
      'react-router/dom',
      'react/jsx-dev-runtime',
      'react/jsx-runtime',
      'three',
      'three/examples/jsm/controls/OrbitControls.js',
      'three/examples/jsm/environments/RoomEnvironment.js',
      'three/examples/jsm/geometries/RoundedBoxGeometry.js',
      'three/examples/jsm/loaders/GLTFLoader.js',
      'three/examples/jsm/objects/Sky.js',
      'three/examples/jsm/postprocessing/OutputPass.js',
      'three/examples/jsm/utils/BufferGeometryUtils.js',
      'tsshogi',
    ],
  },
  plugins: [isolationHeaders(), compactJoseki(), woff2Only(), pandacss(), reactRouter()],
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
  server: { headers: crossOriginIsolation, fs: { allow: ['.', realpathSync('node_modules')] } },
  preview: { headers: crossOriginIsolation },
})
