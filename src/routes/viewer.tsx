import { Suspense, lazy } from 'react'
import { useNavigate } from 'react-router'
import { shellBase } from '@/app/layout.styles'

const PieceViewer = lazy(() => import('@/features/piece-viewer/PieceViewer').then((m) => ({ default: m.PieceViewer })))

export async function clientLoader() {
  return null
}

export function HydrateFallback() {
  return null
}

export default function ViewerRoute() {
  const navigate = useNavigate()
  return (
    <div className={`app-shell ${shellBase}`}>
      <Suspense fallback={null}>
        <PieceViewer page onClose={() => navigate('/')} />
      </Suspense>
    </div>
  )
}
