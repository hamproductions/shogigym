import { index, layout, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  layout('routes/workshop.tsx', [index('routes/page.tsx', { id: 'home' }), route(':mode', 'routes/page.tsx', { id: 'mode' }), route('openings/:main', 'routes/page.tsx', { id: 'openings-main' })]),
  route('viewer', 'routes/viewer.tsx'),
  route('komadai', 'routes/komadai.tsx'),
  route('dev/pieces', 'routes/pieces.tsx'),
  route('dev/hands', 'routes/hands.tsx'),
  route('dev/reel', 'routes/reel.tsx'),
] satisfies RouteConfig
