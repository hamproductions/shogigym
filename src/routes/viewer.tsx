import { Suspense, lazy } from 'react'
import { useNavigate } from 'react-router'

const PieceViewer = lazy(() => import('../workshop/PieceViewer').then((m) => ({ default: m.PieceViewer })))

export async function clientLoader() {
  return null
}

export function HydrateFallback() {
  return null
}

export default function ViewerRoute() {
  const navigate = useNavigate()
  return (
    <div className="ws">
      <Suspense fallback={null}>
        <PieceViewer page onClose={() => navigate('/')} />
      </Suspense>
    </div>
  )
}
