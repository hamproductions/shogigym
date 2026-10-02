import { pageMeta } from './meta'
import type { Route } from './+types/page'

export function meta({ params }: Route.MetaArgs) {
  const p = params as { mode?: string; main?: string }
  const { title, description } = pageMeta(p.mode ?? (p.main ? 'openings' : undefined), p.main)
  return [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }]
}

export default function Page() {
  return null
}
