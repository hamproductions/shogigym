import { metaTags, pageMeta } from './meta'
import type { Route } from './+types/page'

export function meta({ params, location }: Route.MetaArgs) {
  const p = params as { mode?: string; main?: string }
  const { title, description } = pageMeta(p.mode ?? (p.main ? 'openings' : undefined), p.main)
  return metaTags(title, description, location.pathname)
}

export default function Page() {
  return null
}
