import { useEffect, useState } from 'react'
import { reviewMove } from '@/utils/analysis'
import { engineSupported, scoreToCp } from '@/utils/engine'
import { inBook, strip } from '@/utils/book'
import { toSente } from '@/utils/notation'
import { colorSide, positionOf, type Side } from '@/utils/shogi'
import { cachedReview, rememberReview } from '@/app/memory'

export type RatingProgress = { done: number; total: number }

type Options = {
  enabled: boolean
  sfens: string[]
  moves: string[]
  /** Rate both sides' moves; otherwise only `userSide`'s. */
  allSides: boolean
  userSide: Side
  onScore: (key: string, cp: number) => void
}

/** Rates every unrated move of the current game in the background, whichever tab is open. */
export function useAutoRate({ enabled, sfens, moves, allSides, userSide, onScore }: Options): RatingProgress | null {
  const [state, setState] = useState<{ key: string; progress: RatingProgress } | null>(null)
  const movesKey = moves.join(' ')
  const key = `${sfens[0]}|${movesKey}|${allSides}|${userSide}`
  useEffect(() => {
    if (!enabled || !engineSupported()) return
    const list = movesKey ? movesKey.split(' ') : []
    const todo = list.flatMap((usi, i) =>
      sfens[i] && !cachedReview(sfens[i], usi) && (allSides || colorSide(positionOf(sfens[i]).color) === userSide) ? [i] : [],
    )
    if (!todo.length) return
    let cancelled = false
    void (async () => {
      for (let n = 0; n < todo.length && !cancelled; n++) {
        const i = todo[n]
        setState({ key, progress: { done: n, total: todo.length } })
        try {
          const review = await reviewMove(sfens[i], list[i], { movetime: 400, inBook: inBook(sfens[i], list[i]) })
          if (cancelled) return
          rememberReview(sfens[i], list[i], review)
          onScore(strip(sfens[i]), scoreToCp(toSente(review.before, colorSide(positionOf(sfens[i]).color))))
          if (sfens[i + 1]) onScore(strip(sfens[i + 1]), scoreToCp(toSente(review.after, colorSide(positionOf(sfens[i + 1]).color))))
        } catch {
          break
        }
      }
      if (!cancelled) setState(null)
    })()
    return () => {
      cancelled = true
    }
    // sfens/onScore are derived from the same inputs as `key`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key])
  return state?.key === key ? state.progress : null
}
