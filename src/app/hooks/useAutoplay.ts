import { useEffect, useRef } from 'react'
import { applyUsi } from '@/utils/shogi'
import { mainBranch, strip } from '@/utils/book'
import type { BoardSession } from './useBoardSession'

function nextCandidate({ preview, cursor, game, gameOver, nodes, sfen, ai }: BoardSession, bestMove: string | undefined) {
  if (preview) return preview.moves[preview.step]
  if (cursor < game.moves.length) return game.moves[cursor]
  if (gameOver) return undefined
  return mainBranch(nodes?.get(strip(sfen)))?.usi ?? (ai && bestMove !== 'resign' && bestMove !== 'win' ? bestMove : undefined)
}

export function useAutoplay(session: BoardSession, bestMove: string | undefined) {
  const { mode, preview, setPreview, cursor, setCursor, game, sfen, playing, setPlaying, play } = session
  const lastStep = useRef<number | null>(null)
  const candidate = nextCandidate(session, bestMove)
  const upcoming = candidate && applyUsi(sfen, candidate) ? candidate : undefined
  useEffect(() => {
    if (mode === 'view' && !preview && cursor === game.moves.length) return
    if (!playing) {
      lastStep.current = null
      return
    }
    if (!upcoming) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(
      () => {
        lastStep.current = performance.now()
        if (preview) setPreview({ ...preview, step: preview.step + 1 })
        else if (cursor < game.moves.length) setCursor(cursor + 1)
        else play(upcoming)
      },
      lastStep.current === null ? 0 : Math.max(0, 1100 - (performance.now() - lastStep.current)),
    )
    return () => clearTimeout(timer)
  }, [mode, playing, upcoming, cursor, game.moves.length, play, preview, setPreview, setCursor, setPlaying])
  return mode === 'view' ? undefined : upcoming
}
