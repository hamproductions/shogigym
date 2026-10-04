import { Suspense, lazy } from 'react'

const PieceTypefacesTest = import.meta.env.DEV ? lazy(() => import('../workshop/PieceTypefacesTest')) : null

export async function clientLoader() {
  return null
}

export function HydrateFallback() {
  return null
}

export default function PiecesRoute() {
  if (!PieceTypefacesTest) return null
  return (
    <Suspense fallback={null}>
      <PieceTypefacesTest />
    </Suspense>
  )
}
