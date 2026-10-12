import type { Config } from '@react-router/dev/config'
import { mainStrategies } from './src/data/strategies.ts'

// PRERENDER=full renders every route; min renders only '/'. Previews default to min, production to full.
const prerender = process.env.PRERENDER ?? (process.env.PREVIEW ? 'min' : 'full')

const MODES = ['play', 'view', 'analyze', 'openings', 'review', 'tsume', 'tesuji']

export default {
  appDirectory: 'src',
  ssr: false,
  basename: process.env.BASE_PATH ?? '/',
  prerender: prerender === 'full' ? ['/', '/taikyoku', ...MODES.map((m) => `/${m}`), ...mainStrategies().map((s) => `/openings/${s.id}`)] : ['/'],
} satisfies Config
