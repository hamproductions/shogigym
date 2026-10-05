import type { ImmutablePosition } from 'tsshogi'

const board3 = (sfen: string) => sfen.split(' ').slice(0, 3).join(' ')

export function steppedMove(prev: ImmutablePosition, position: ImmutablePosition, usi?: string) {
  if (!usi) return null
  const next = prev.clone()
  const move = next.createMoveByUSI(usi)
  if (!move || !next.doMove(move) || board3(next.sfen) !== board3(position.sfen)) return null
  return { capture: !!move.capturedPieceType }
}
