import { useEffect } from 'react'
import { mainBranch, strip } from '../lib/book'
import type { BoardSession } from './useBoardSession'

export function useAutoplay({ preview, setPreview, cursor, setCursor, game, nodes, sfen, ai, playing, setPlaying, play }: BoardSession, bestMove: string | undefined) {
  const upcoming = preview ? preview.moves[preview.step] : cursor < game.moves.length ? game.moves[cursor] : (mainBranch(nodes?.get(strip(sfen)))?.usi ?? (ai ? bestMove : undefined))
  useEffect(() => {
    if (!playing) return
    if (!upcoming) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(() => {
      if (preview) setPreview({ ...preview, step: preview.step + 1 })
      else if (cursor < game.moves.length) setCursor(cursor + 1)
      else play(upcoming)
    }, 1100)
    return () => clearTimeout(timer)
  }, [playing, upcoming, cursor, game.moves.length, play, preview, setPreview, setCursor, setPlaying])
  return upcoming
}
