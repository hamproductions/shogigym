import { Suspense, lazy } from 'react'

const KomadaiTest = import.meta.env.DEV ? lazy(() => import('../dev/KomadaiTest')) : null

export async function clientLoader() {
  return null
}

export function HydrateFallback() {
  return null
}

export default function KomadaiRoute() {
  if (!KomadaiTest) return null
  return (
    <Suspense fallback={null}>
      <KomadaiTest />
    </Suspense>
  )
}
