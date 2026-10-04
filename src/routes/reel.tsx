import { Suspense, lazy } from 'react'

const ReelTest = import.meta.env.DEV ? lazy(() => import('../dev/ReelTest')) : null

export async function clientLoader() {
  return null
}

export function HydrateFallback() {
  return null
}

export default function ReelRoute() {
  if (!ReelTest) return null
  return (
    <Suspense fallback={null}>
      <ReelTest />
    </Suspense>
  )
}
