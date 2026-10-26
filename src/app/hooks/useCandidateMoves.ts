import { useState } from 'react'
import { useSettings } from '@/appearance/settings'
import type { Analysis } from '@/utils/engine'
import type { BoardSession } from './useBoardSession'

export function useCandidateMoves(session: BoardSession, analysis: Analysis | null, allowed: boolean) {
  const settings = useSettings()
  const { sfen, position, mode, userTurn, assist, ai, atEnd, preview, gameOver, visualMoving, opponentMoving } = session
  const [selection, setSelection] = useState<{ context: string; move: string } | null>(null)
  const available =
    allowed && (mode === 'spar' || mode === 'analyze') && assist && ai && userTurn && atEnd && !preview && !gameOver && !visualMoving && !opponentMoving
  const context = `${mode}|${sfen}|${available}|${settings.threeChoices}`
  if (selection && selection.context !== context) setSelection(null)
  const candidates =
    available && settings.threeChoices
      ? (analysis?.candidates ?? [])
          .filter((candidate, index, all) => {
            const move = position.createMoveByUSI(candidate.move)
            return move && position.isValidMove(move) && all.findIndex((other) => other.move === candidate.move) === index
          })
          .slice(0, 3)
      : []
  const selected = selection?.context === context ? (candidates.find((candidate) => candidate.move === selection.move) ?? null) : null
  return { available, candidates, selected, select: (move: string | null) => setSelection(move && available ? { context, move } : null) }
}

export type CandidateMoves = ReturnType<typeof useCandidateMoves>
