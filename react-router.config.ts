import type { Config } from '@react-router/dev/config'
import { mainStrategies } from './src/data/strategies.ts'
import { MODE_SLUGS, NOT_FOUND_PATH } from './src/routes/paths.ts'

// PRERENDER=full renders every route; min renders only '/'. Previews default to min, production to full.
const prerender = process.env.PRERENDER ?? (process.env.PREVIEW ? 'min' : 'full')

export default {
  appDirectory: 'src',
  ssr: false,
  basename: process.env.BASE_PATH ?? '/',
  prerender:
    prerender === 'full'
      ? ['/', NOT_FOUND_PATH, '/taikyoku', ...MODE_SLUGS.map((m) => `/${m}`), ...mainStrategies().map((s) => `/openings/${s.id}`)]
      : ['/', NOT_FOUND_PATH],
} satisfies Config
