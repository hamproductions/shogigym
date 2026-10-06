import { Square } from 'tsshogi'
import i18n from '@/utils/i18n'
import { positionOf } from '@/utils/shogi'
import { PIECE_INFO } from '@/app/pieceInfo'
import type { Problem } from '@/app/practice'

export function firstPieceHint(problem: Problem) {
  const move = positionOf(problem.sfen).createMoveByUSI(problem.pv[0])
  if (!move) return i18n.t('tsume.pieces')
  const name = PIECE_INFO[move.pieceType]
  return move.from instanceof Square ? i18n.t('tsume.onTheBoard', { ja: name.ja }) : i18n.t('tsume.inHandADrop', { ja: name.ja })
}
