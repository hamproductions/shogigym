import { Suspense, lazy } from 'react'

const CameraSender = lazy(() => import('@/features/camera/CameraSender').then((m) => ({ default: m.CameraSender })))

export async function clientLoader() {
  return null
}

export function HydrateFallback() {
  return null
}

export default function CameraSendRoute() {
  return (
    <Suspense fallback={null}>
      <CameraSender />
    </Suspense>
  )
}
