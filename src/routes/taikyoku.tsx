import { Suspense, lazy } from 'react'
import { useNavigate } from 'react-router'
import { metaTags, pageMeta } from './meta'
import type { Route } from './+types/taikyoku'

const TaikyokuPage = lazy(() => import('@/features/taikyoku/TaikyokuPage').then((m) => ({ default: m.TaikyokuPage })))

export function meta({ location }: Route.MetaArgs) {
  const { title, description } = pageMeta('taikyoku', undefined)
  return metaTags(title, description, location.pathname)
}

export async function clientLoader() {
  return null
}

export function HydrateFallback() {
  return null
}

export default function TaikyokuRoute() {
  const navigate = useNavigate()
  return (
    <Suspense fallback={null}>
      <TaikyokuPage onBack={() => navigate('/')} />
    </Suspense>
  )
}
