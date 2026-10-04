import { useEffect, useRef } from 'react'
import { applyUsi } from '../../shogi'
import { mainBranch, strip } from '../lib/book'
import type { BoardSession } from './useBoardSession'

export function useAutoplay({ mode, preview, setPreview, cursor, setCursor, game, nodes, sfen, ai, playing, setPlaying, play, gameOver }: BoardSession, bestMove: string | undefined) {
  const lastStep = useRef<number | null>(null)
  const candidate = preview ? preview.moves[preview.step] : cursor < game.moves.length ? game.moves[cursor] : gameOver ? undefined : (mainBranch(nodes?.get(strip(sfen)))?.usi ?? (ai && bestMove !== 'resign' && bestMove !== 'win' ? bestMove : undefined))
  const upcoming = candidate && applyUsi(sfen, candidate) ? candidate : undefined
  useEffect(() => {
    if (mode === 'view') return
    if (!playing) {
      lastStep.current = null
      return
    }
    if (!upcoming) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(() => {
      lastStep.current = performance.now()
      if (preview) setPreview({ ...preview, step: preview.step + 1 })
      else if (cursor < game.moves.length) setCursor(cursor + 1)
      else play(upcoming)
    }, lastStep.current === null ? 0 : Math.max(0, 1100 - (performance.now() - lastStep.current)))
    return () => clearTimeout(timer)
  }, [mode, playing, upcoming, cursor, game.moves.length, play, preview, setPreview, setCursor, setPlaying])
  return mode === 'view' ? undefined : upcoming
}
