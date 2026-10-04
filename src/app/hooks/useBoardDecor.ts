import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Color, type Square } from 'tsshogi'
import { LABELS, type MoveReview } from '../../analysis'
import type { Analysis } from '../../engine'
import { formationName, formationOf } from '../../formation'
import { kingSquare, reachable } from '../../shogi'
import type { BoardArrow } from '../../rendering/Board3D'
import { EMPTY_CELL, controlHeat, controlMap, focusHeat, type ControlCell } from '../lib/control'
import type { BookHit } from '../lib/book'
import { isWeak } from '../lib/mistake'
import { sideMark, squareName } from '../lib/notation'
import { PIECE_INFO, sees } from '../pieces'
import type { Tesuji } from '../tesuji'
import type { Level, Tab } from '../types'
import type { BoardSession } from './useBoardSession'

const SHU = '#c8442f'
const REPLY_BLUE = '#8fa6d8'
const REFUTE_BLUE = '#2b6cb0'
const LANE_AMBER = '#e0a23a'
const SENTE_BLUE = '#1f7ae0'
const GOTE_RED = '#d2402a'

type DecorInput = {
  analysis: Analysis | null
  showBest: boolean
  tab: Tab
  spoilerFree: boolean
  modeArrows: BoardArrow[]
  review: MoveReview | null
  reviewAt: number
  reply: { usi: string } | null
  upcoming: string | undefined
  hoverLane: string | null
  showControl: boolean
  showEscape: boolean
  level: Level
  nudge: string | null
  checking: boolean
  tesujiNote: Tesuji | null
  bookLast: BookHit | null
}

export function useBoardDecor(session: BoardSession, input: DecorInput) {
  const { t, i18n } = useTranslation()
  const { position, sfen, preview, gameOver, cursor, game, peekFrom, mode, course, userSide, userTurn, atEnd, ai, assist, lastMove } = session
  const { analysis, showBest, tab, spoilerFree, modeArrows, review, reviewAt, reply, upcoming, hoverLane, showControl, showEscape, level, nudge, checking, tesujiNote, bookLast } = input

  const control = useMemo(() => controlMap(sfen, position), [sfen, position])
  const peekSquare = peekFrom && position.board.at(peekFrom) ? peekFrom : null
  const focusSquare = peekFrom && !position.board.at(peekFrom) ? peekFrom : null
  const focusCell: ControlCell | null = focusSquare ? (control.get(focusSquare.usi) ?? EMPTY_CELL) : null
  const heat = [...(showControl ? controlHeat(control) : []), ...(focusSquare && focusCell ? [focusHeat(focusSquare, focusCell)] : [])]

  const arrows: BoardArrow[] = []
  const best = analysis?.candidates[0]
  if (!gameOver && ai && assist && best && showBest && !spoilerFree && (mode === 'analyze' || mode === 'view' || tab === 'engine')) {
    for (const c of analysis!.candidates.slice(1)) if (c.move !== best.move) arrows.push({ usi: c.move, color: SHU, dashed: true })
    arrows.push({ usi: best.move, color: SHU, label: t('app.best') })
  }
  arrows.push(...modeArrows)
  if (assist && review && isWeak(review.label) && tab === 'coach' && review.reply && reviewAt === cursor && !preview) arrows.push({ usi: review.reply.move, color: REFUTE_BLUE })
  if (reply) arrows.push({ usi: reply.usi, color: REPLY_BLUE })
  if (preview && upcoming) arrows.push({ usi: upcoming, color: REPLY_BLUE })
  if (hoverLane && !preview && tab === 'flow') arrows.push({ usi: hoverLane, color: LANE_AMBER })
  if (focusSquare && focusCell) {
    arrows.length = 0
    for (const sq of focusCell.s) arrows.push({ usi: `${sq.usi}${focusSquare.usi}`, color: SENTE_BLUE })
    for (const sq of focusCell.g) arrows.push({ usi: `${sq.usi}${focusSquare.usi}`, color: GOTE_RED })
  }

  const enemyColor = mode === 'analyze' || (mode === 'lesson' && !course) ? (position.color === Color.BLACK ? Color.WHITE : Color.BLACK) : userSide === 'sente' ? Color.WHITE : Color.BLACK
  const enemyKing = showEscape && mode === 'tsume' ? kingSquare(sfen, enemyColor) : null
  const peekTargets = peekSquare ? sees(sfen, peekSquare).filter((sq) => level !== 'new' || position.board.at(sq)?.color !== position.board.at(peekSquare)?.color) : enemyKing ? reachable(sfen, enemyKing) : []
  const peekPiece = peekSquare ? position.board.at(peekSquare) : null
  const peekNote = peekSquare && peekPiece
    ? t('app.pieceCovers', { piece: `${sideMark(peekPiece.color)}${PIECE_INFO[peekPiece.type].ja.slice(0, 1)}`, square: squareName(peekSquare), count: peekTargets.length }) + (level === 'new' ? ` ${PIECE_INFO[peekPiece.type].moves}` : '')
    : enemyKing
      ? peekTargets.length
        ? t('app.kingEscapes', { side: sideMark(enemyColor), count: peekTargets.length })
        : t('app.theKingYouAreAttacking', { side: sideMark(enemyColor) })
      : null
  const pieceAt = (sq: Square) => `${PIECE_INFO[position.board.at(sq)!.type].ja.slice(0, 1)}${squareName(sq)}`
  const focusNote = focusSquare && focusCell ? `${squareName(focusSquare)}: ☗ ${focusCell.s.length ? focusCell.s.map(pieceAt).join(' ') : t('app.none')} · ☖ ${focusCell.g.length ? focusCell.g.map(pieceAt).join(' ') : t('app.none')}${focusCell.s.length !== focusCell.g.length ? t('app.controlsIt', { value: focusCell.s.length > focusCell.g.length ? '☗' : '☖' }) : focusCell.s.length ? t('app.contested') : ''}` : null
  const checkHelp = mode === 'spar' && position.checked && userTurn && atEnd && !gameOver && !preview ? t('app.checkYourKingIsAttacked') : null
  const note = nudge ?? (checking ? t('app.checkingThatMove') : (focusNote ?? peekNote ?? (tesujiNote ? t('app.tesuji2', { ja: tesujiNote.ja, en: tesujiNote.en, explain: tesujiNote.explain }) : checkHelp)))

  const castles = [Color.BLACK, Color.WHITE].flatMap((color) => {
    const f = formationOf(position, color)
    return f.castle && f.castle !== '居玉' ? [{ squares: f.squares, color: color === Color.BLACK ? '#b8432f' : '#2f5d9b', label: formationName(f.castle, i18n.language) }] : []
  })
  const reviewedMove = !preview && reviewAt > 0 ? game.moves[reviewAt - 1] : undefined
  const stamp = !assist ? null : review && reviewedMove ? { square: reviewedMove.slice(2, 4), text: LABELS[review.label].symbol, color: LABELS[review.label].color } : lastMove && bookLast ? { square: lastMove.slice(2, 4), text: '本', color: '#a88865' } : null

  return { arrows, heat, peekTargets, peekFrom: peekSquare ?? enemyKing, note, castles, stamp, checkSquare: position.checked ? kingSquare(sfen, position.color) : null }
}
