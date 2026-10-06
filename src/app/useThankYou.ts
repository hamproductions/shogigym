import { useEffect, useRef } from 'react'
import type { GameResult } from '@/app/games'
import type { Mode } from '@/app/types'
import { say } from '@/utils/voice'

interface ThankYouState {
  mode: Mode
  restored: boolean
  result: GameResult | null
  watchResult: unknown
  watchWon: boolean
  atEnd: boolean
  hasMoves: boolean
  gameOver: boolean
  /** A dialog that should not be talked over is open. */
  busy: boolean
}

/** Says thanks once a finished game has settled and no dialog is open. */
export function useThankYou({ mode, restored, result, watchResult, watchWon, atEnd, hasMoves, gameOver, busy }: ThankYouState) {
  const finished = !!result || !!watchResult
  const won = result === 'win' || (mode === 'view' && watchWon)
  const previousState = useRef({ mode, finished, restored })
  useEffect(() => {
    const previous = previousState.current
    previousState.current = { mode, finished, restored }
    if (!previous.restored || previous.mode !== mode || previous.finished) return
    if (!won || !atEnd || !hasMoves || busy || gameOver) return
    return say('ありがとうございました')
  }, [mode, restored, finished, won, atEnd, hasMoves, gameOver, busy])
}
