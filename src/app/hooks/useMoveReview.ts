import { useEffect, useState } from 'react'
import { reviewMove, type MoveReview } from '@/utils/analysis'
import { engineSupported } from '@/utils/engine'
import { colorSide, positionOf } from '@/utils/shogi'
import { inBook } from '@/utils/book'
import { cachedReview, rememberReview } from '@/app/memory'
import { isGameMode } from '@/app/types'
import type { BoardSession } from './useBoardSession'

function useReview(sfens: string[], moves: string[], cursor: number, enabled: boolean) {
  const [state, setState] = useState<{ key: string; review: MoveReview } | null>(null)
  const key = cursor > 0 ? `${sfens[cursor - 1]}|${moves[cursor - 1]}` : ''
  useEffect(() => {
    if (!key || !enabled || !engineSupported()) return
    let cancelled = false
    const [prev, usi] = key.split('|')
    const known = cachedReview(prev, usi)
    if (known) {
      queueMicrotask(() => !cancelled && setState({ key, review: known }))
      return () => {
        cancelled = true
      }
    }
    reviewMove(prev, usi, { inBook: inBook(prev, usi) })
      .then((review) => {
        rememberReview(prev, usi, review)
        if (!cancelled) setState({ key, review })
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [key, enabled])
  return enabled && state?.key === key ? state.review : null
}

export function useMoveReview({ mode, cursor, sfens, game, userSide, ai }: BoardSession) {
  const reviewAt = mode === 'spar' && cursor > 0 && colorSide(positionOf(sfens[cursor - 1]).color) !== userSide ? cursor - 1 : cursor
  const review = useReview(sfens, game.moves, reviewAt, ai && (isGameMode(mode) || mode === 'view'))
  return { review, reviewAt }
}

export type CoachReview = ReturnType<typeof useMoveReview>
