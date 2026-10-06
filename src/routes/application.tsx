import { Suspense, lazy } from 'react'
import { Outlet, useParams } from 'react-router'
import { Shell } from './Shell'

const shellFallback = <Shell />
const Application = lazy(() => import('@/app/Application').then((m) => ({ default: m.Application })))

export async function clientLoader() {
  return null
}

export function HydrateFallback() {
  return <Shell />
}

export default function ApplicationLayout() {
  const params = useParams()
  return (
    <Suspense fallback={shellFallback}>
      <Application routeMode={params.mode} routeMain={params.main} />
      <Outlet />
    </Suspense>
  )
}
