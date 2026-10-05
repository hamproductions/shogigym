import { useMemo, useState } from 'react'
import type { Analysis } from '@/utils/engine'
import { buildLanes, type Lane } from '@/utils/lanes'
import type { BoardSession } from './useBoardSession'

const NO_LANES: Lane[] = []

export function useFlowLanes({ sfen, nodes, ai, preview, gameOver }: BoardSession, analysis: Analysis | null) {
  const liveLanes = useMemo(() => buildLanes(sfen, nodes, ai ? analysis : null), [sfen, nodes, ai, analysis])
  const [shown, setShown] = useState({ lanes: liveLanes, sfen })
  const current = preview ? shown : { lanes: gameOver ? NO_LANES : liveLanes, sfen }
  if (current.lanes !== shown.lanes || current.sfen !== shown.sfen) setShown(current)
  const [hoverLane, setHoverLane] = useState<string | null>(null)
  return { lanes: current.lanes, lanesSfen: current.sfen, hoverLane, setHoverLane }
}
