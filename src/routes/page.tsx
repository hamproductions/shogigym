import { metaTags, pageMeta } from './meta'
import { routeParams } from './paths'
import type { Route } from './+types/page'

export function meta({ location }: Route.MetaArgs) {
  const { mode, main } = routeParams(location.pathname)
  const { title, description } = pageMeta(mode ?? (main ? 'openings' : undefined), main)
  return metaTags(title, description, location.pathname)
}

export default function Page() {
  return null
}
