import { Suspense, lazy } from 'react'

const HistoricalTest = import.meta.env.DEV ? lazy(() => import('@/dev/HistoricalTest')) : null

export async function clientLoader() {
  return null
}

export function HydrateFallback() {
  return null
}

export default function HistoricalRoute() {
  if (!HistoricalTest) return null
  return (
    <Suspense fallback={null}>
      <HistoricalTest />
    </Suspense>
  )
}
