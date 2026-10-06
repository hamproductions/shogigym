import { Suspense, lazy } from 'react'
import { BoardLoading } from '@/rendering/BoardLoading'

const loadingFallback = <BoardLoading />
const HandsTest = import.meta.env.DEV ? lazy(() => import('@/dev/HandsTest')) : null

export async function clientLoader() {
  return <BoardLoading />
}

export function HydrateFallback() {
  return null
}

export default function HandsRoute() {
  if (!HandsTest) return null
  return (
    <Suspense fallback={loadingFallback}>
      <HandsTest />
    </Suspense>
  )
}
