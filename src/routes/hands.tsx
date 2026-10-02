import { Suspense, lazy } from 'react'

const HandsTest = import.meta.env.DEV ? lazy(() => import('../workshop/HandsTest')) : null

export async function clientLoader() {
  return null
}

export function HydrateFallback() {
  return null
}

export default function HandsRoute() {
  if (!HandsTest) return null
  return (
    <Suspense fallback={null}>
      <HandsTest />
    </Suspense>
  )
}
