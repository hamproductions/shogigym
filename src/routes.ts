import { index, layout, route, type RouteConfig } from '@react-router/dev/routes'
import { env } from 'node:process'
import { mainStrategies } from './data/strategies'
import { MODE_SLUGS } from './routes/paths'

export default [
  layout('routes/application.tsx', [
    index('routes/page.tsx', { id: 'home' }),
    ...MODE_SLUGS.map((slug) => route(slug, 'routes/page.tsx', { id: `mode-${slug}` })),
    ...mainStrategies().map((s) => route(`openings/${s.id}`, 'routes/page.tsx', { id: `openings-${s.id}` })),
  ]),
  route('viewer', 'routes/viewer.tsx'),
  route('camera-send', 'routes/camera-send.tsx'),
  route('taikyoku', 'routes/taikyoku.tsx'),
  ...(env.NODE_ENV === 'production'
    ? []
    : [
        route('dev/komadai', 'routes/komadai.tsx'),
        route('dev/pieces', 'routes/pieces.tsx'),
        route('dev/hands', 'routes/hands.tsx'),
        route('dev/reel', 'routes/reel.tsx'),
        route('dev/historical', 'routes/historical.tsx'),
      ]),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
