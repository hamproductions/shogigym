import { readdirSync, readFileSync, realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import pandacss from '@pandacss/vite'
import { reactRouter } from '@react-router/dev/vite'
import { defineConfig, type Plugin } from 'vite'
import { positionHash } from './src/utils/positionHash.ts'
import { DERIVED, derive } from './src/utils/derivedCourses.ts'

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
    const file = id.split('?')[0]
    if (!file.includes('@fontsource') || !file.endsWith('.css')) return
    const stable = /@fontsource[\\/](zen-kaku-gothic-new|shippori-mincho-b1)[\\/]/.test(file)
    const css = code.replace(/,\s*url\([^)]*\.woff\) format\('woff'\)/g, '')
    return stable ? css.replace(/font-display:\s*swap/g, 'font-display: optional') : css
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

type IndexNode = { sfen: string; branches: { kind: string; child?: IndexNode | null }[] }

type IndexCourse = {
  id: string
  root: IndexNode & { id: string }
  source?: string
  goalFormation?: string
  mySide: string
  userSide?: string
  opponentStrategy: string
}

type IndexLesson = { check?: unknown; source?: string; courses: IndexCourse[] }

function trainableOf(root: IndexNode) {
  const trainable: Record<'sente' | 'gote', string[]> = { sente: [], gote: [] }
  const walk = (node: IndexNode) => {
    if (node.branches.some((b) => b.kind !== 'deviation')) trainable[node.sfen.split(' ')[1] === 'b' ? 'sente' : 'gote'].push(positionHash(node.sfen))
    for (const branch of node.branches) if (branch.child) walk(branch.child)
  }
  walk(root)
  return trainable
}

function indexCourse({ root, source: _source, goalFormation: _goal, ...course }: IndexCourse, file: string, withLine = true) {
  const mainLine: string[] = []
  for (let node: IndexNode | null | undefined = withLine ? root : null; node;) {
    const next: (IndexNode['branches'][number] & { usi: string }) | undefined =
      (node.branches as (IndexNode['branches'][number] & { usi: string })[]).find((b) => b.kind === 'main') ??
      (node.branches as (IndexNode['branches'][number] & { usi: string })[]).find((b) => b.kind !== 'deviation')
    if (!next) break
    mainLine.push(next.usi)
    node = next.child
  }
  return {
    ...course,
    userSide: course.userSide ?? undefined,
    root: { id: root.id, sfen: root.sfen, branches: [] },
    mainLine: withLine ? mainLine : undefined,
    file,
  }
}

const englishMoveFacts = (): Plugin => {
  const id = 'virtual:english-move-facts'
  const file = fileURLToPath(new URL('./src/locales/en.json', import.meta.url))
  return {
    name: 'english-move-facts',
    resolveId: (source) => (source === id ? `\0${id}` : undefined),
    load(source) {
      if (source !== `\0${id}`) return
      this.addWatchFile(file)
      return `export default ${JSON.stringify(JSON.parse(readFileSync(file, 'utf8')).moveFacts)}`
    },
  }
}

const courseIndex = (): Plugin => {
  const id = 'virtual:course-index'
  const trainableId = 'virtual:course-trainable'
  const bookId = 'virtual:book-positions'
  const ids = [id, trainableId, bookId]
  const root = fileURLToPath(new URL('.', import.meta.url))
  const dirs = [
    { dir: `${root}vendor/shiryu-joseki/src/data/joseki`, key: '../../vendor/shiryu-joseki/src/data/joseki/' },
    { dir: `${root}src/data/joseki`, key: '../data/joseki/' },
  ]
  const lessonDir = `${root}src/data/lessons`
  return {
    name: 'course-index',
    resolveId: (source) => (ids.includes(source) ? `\0${source}` : undefined),
    load(source) {
      if (!ids.some((known) => source === `\0${known}`)) return
      const raws: { raw: IndexCourse; file: string }[] = dirs.flatMap(({ dir, key }) =>
        readdirSync(dir)
          .filter((file) => file.endsWith('.json'))
          .map((file) => {
            this.addWatchFile(`${dir}/${file}`)
            return { raw: JSON.parse(readFileSync(`${dir}/${file}`, 'utf8')) as IndexCourse, file: key + file }
          }),
      )
      const josekiRaws = [
        ...raws,
        ...DERIVED.map((spec) => {
          const base = raws.find(({ raw }) => raw.id === spec.from)!
          return { raw: derive(base.raw as never, spec) as never as IndexCourse, file: base.file, derivedFrom: spec.from }
        }),
      ]
      const lessonFiles = readdirSync(lessonDir)
        .filter((file) => file.endsWith('.json'))
        .map((file) => {
          this.addWatchFile(`${lessonDir}/${file}`)
          return { file, lesson: JSON.parse(readFileSync(`${lessonDir}/${file}`, 'utf8')) as IndexLesson }
        })
      if (source === `\0${bookId}`) {
        const files = raws.map(({ file }) => file)
        const at: Record<string, number[]> = {}
        raws.forEach(({ raw }, index) => {
          const walk = (node: IndexNode) => {
            const hash = positionHash(node.sfen)
            if (at[hash]?.at(-1) !== index) (at[hash] ??= []).push(index)
            for (const branch of node.branches) if (branch.child && branch.kind !== 'deviation') walk(branch.child)
          }
          walk(raw.root)
        })
        return `export default JSON.parse(${JSON.stringify(JSON.stringify({ files, at }))})`
      }
      if (source === `\0${trainableId}`) {
        const courses = [...josekiRaws.map(({ raw }) => raw), ...lessonFiles.flatMap(({ lesson }) => lesson.courses)]
        return `export default JSON.parse(${JSON.stringify(JSON.stringify(Object.fromEntries(courses.map((course) => [course.id, trainableOf(course.root)]))))})`
      }
      const joseki = josekiRaws.map(({ raw, file, ...rest }) => ({ ...indexCourse(raw, file), ...rest }))
      const lessons = lessonFiles.map(({ file, lesson: { check: _check, source: _source, courses, ...lesson } }) => ({
        ...lesson,
        courses: courses.map((course) => indexCourse(course, `../data/lessons/${file}`, false)),
      }))
      return `export default JSON.parse(${JSON.stringify(JSON.stringify({ joseki, lessons }))})`
    },
  }
}

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
  plugins: [isolationHeaders(), compactJoseki(), courseIndex(), englishMoveFacts(), woff2Only(), pandacss(), reactRouter()],
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
