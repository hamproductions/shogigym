import type { Config } from '@react-router/dev/config'
import { mainStrategies } from './src/data/strategies.ts'

const MODES = ['play', 'analyze', 'openings', 'review', 'tsume', 'tesuji']

export default {
  appDirectory: 'src',
  ssr: false,
  basename: process.env.BASE_PATH ?? '/',
  prerender: ['/', ...MODES.map((m) => `/${m}`), ...mainStrategies().map((s) => `/openings/${s.id}`)],
} satisfies Config
