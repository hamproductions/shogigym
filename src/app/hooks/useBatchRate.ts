import { useEffect, useState } from 'react'
import { reviewMove } from '@/utils/analysis'
import { inBook } from '@/utils/book'
import { engineSupported } from '@/utils/engine'
import { playerMoves } from '@/utils/learning'
import type { Side } from '@/utils/shogi'
import { cachedReview, rememberReview } from '@/app/memory'
import type { RatingProgress } from './useAutoRate'

type Rateable = { id: string; start: string; moves: string[]; side: Side }

/** Rates unrated moves across several games, your own moves first, until closed or finished. */
export function useBatchRate(games: Rateable[], enabled: boolean): RatingProgress | null {
  const [state, setState] = useState<{ key: string; progress: RatingProgress } | null>(null)
  const key = games.map((g) => `${g.id}:${g.side}:${g.moves.length}`).join('|')
  useEffect(() => {
    if (!enabled || !engineSupported()) return
    const todo = [...games.flatMap((g) => playerMoves(g, g.side)), ...games.flatMap((g) => playerMoves(g, g.side === 'sente' ? 'gote' : 'sente'))].filter(
      (m) => !cachedReview(m.sfen, m.usi),
    )
    const seen = new Set<string>()
    const queue = todo.filter((m) => {
      const k = `${m.sfen}|${m.usi}`
      return seen.has(k) ? false : (seen.add(k), true)
    })
    if (!queue.length) return
    let cancelled = false
    void (async () => {
      for (let n = 0; n < queue.length && !cancelled; n++) {
        setState({ key, progress: { done: n, total: queue.length } })
        try {
          rememberReview(
            queue[n].sfen,
            queue[n].usi,
            await reviewMove(queue[n].sfen, queue[n].usi, { movetime: 300, inBook: inBook(queue[n].sfen, queue[n].usi) }),
          )
        } catch {
          break
        }
      }
      if (!cancelled) setState(null)
    })()
    return () => {
      cancelled = true
    }
    // `key` summarises `games`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key])
  return state?.key === key ? state.progress : null
}
