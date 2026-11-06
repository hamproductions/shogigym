import { type Color, type PieceType, Square, formatMove } from 'tsshogi'
import { positionOf } from './shogi'

export type CoachingStep = {
  sfen: string
  usi: string
  text: string
  from: string | null
  to: string
  piece: PieceType
  captured: PieceType | null
  promote: boolean
  givesCheck: boolean
  color: Color
}

export function coachingLine(sfen: string, pv: readonly string[], maxPlies = 4): CoachingStep[] {
  const position = positionOf(sfen)
  const steps: CoachingStep[] = []
  for (const usi of pv.slice(0, Math.max(0, maxPlies))) {
    const move = position.createMoveByUSI(usi)
    if (!move || move.usi !== usi || !position.isValidMove(move)) break
    const step = {
      sfen: position.sfen,
      usi,
      text: formatMove(position, move),
      from: move.from instanceof Square ? move.from.usi : null,
      to: move.to.usi,
      piece: move.pieceType,
      captured: move.capturedPieceType,
      promote: move.promote,
      givesCheck: false,
      color: move.color,
    }
    if (!position.doMove(move)) break
    step.givesCheck = position.checked
    steps.push(step)
  }
  return steps
}
