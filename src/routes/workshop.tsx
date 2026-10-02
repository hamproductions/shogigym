import { Suspense, lazy } from 'react'
import { Outlet, useParams } from 'react-router'
import { Shell } from './Shell'

const Workshop = lazy(() => import('../workshop/Workshop').then((m) => ({ default: m.Workshop })))

export async function clientLoader() {
  return null
}

export function HydrateFallback() {
  return <Shell />
}

export default function WorkshopLayout() {
  const params = useParams()
  return (
    <Suspense fallback={<Shell />}>
      <Workshop routeMode={params.mode} routeMain={params.main} />
      <Outlet />
    </Suspense>
  )
}
