import { useMemo } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { Color, type Position, type Square } from 'tsshogi'
import { LABELS, type MoveReview } from '@/utils/analysis'
import type { Analysis } from '@/utils/engine'
import type { Course } from '@/utils/model'
import { formationName, formationOf } from '@/utils/formation'
import { kingSquare, reachable, type Side } from '@/utils/shogi'
import type { BoardArrow } from '@/rendering/Board3D'
import { EMPTY_CELL, controlHeat, controlMap, focusHeat, type ControlCell } from '@/utils/control'
import type { BookHit } from '@/utils/book'
import { isWeak } from '@/utils/mistake'
import { sideMark, squareName } from '@/utils/notation'
import { PIECE_INFO, sees } from '@/app/pieceInfo'
import type { Tesuji } from '@/app/tesuji'
import type { Level, Mode, Tab } from '@/app/types'
import type { BoardSession } from './useBoardSession'

const SHU = '#c8442f'
const REPLY_BLUE = '#8fa6d8'
const REFUTE_BLUE = '#2b6cb0'
const LANE_AMBER = '#e0a23a'
const SENTE_BLUE = '#1f7ae0'
const GOTE_RED = '#d2402a'

interface DecorInput {
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

function oppositeColor(color: Color) {
  return color === Color.BLACK ? Color.WHITE : Color.BLACK
}

function enemyColorOf(mode: Mode, course: Course | null, position: Position, userSide: Side) {
  if (mode === 'analyze' || (mode === 'lesson' && !course)) return oppositeColor(position.color)
  return userSide === 'sente' ? Color.WHITE : Color.BLACK
}

function peekNoteOf(
  t: TFunction,
  position: Position,
  level: Level,
  peekSquare: Square | null,
  peekTargets: Square[],
  enemyKing: Square | null,
  enemyColor: Color,
) {
  const peekPiece = peekSquare ? position.board.at(peekSquare) : null
  if (peekSquare && peekPiece) {
    return (
      t('app.pieceCovers', {
        piece: `${sideMark(peekPiece.color)}${PIECE_INFO[peekPiece.type].ja.slice(0, 1)}`,
        square: squareName(peekSquare),
        count: peekTargets.length,
      }) + (level === 'new' ? ` ${PIECE_INFO[peekPiece.type].moves}` : '')
    )
  }
  if (!enemyKing) return null
  return peekTargets.length
    ? t('app.kingEscapes', { side: sideMark(enemyColor), count: peekTargets.length })
    : t('app.theKingYouAreAttacking', { side: sideMark(enemyColor) })
}

function contestNote(t: TFunction, cell: ControlCell) {
  if (cell.s.length !== cell.g.length) return t('app.controlsIt', { value: cell.s.length > cell.g.length ? '☗' : '☖' })
  return cell.s.length ? t('app.contested') : ''
}

function focusNoteOf(t: TFunction, position: Position, square: Square | null, cell: ControlCell | null) {
  if (!square || !cell) return null
  const pieceAt = (sq: Square) => `${PIECE_INFO[position.board.at(sq)!.type].ja.slice(0, 1)}${squareName(sq)}`
  const list = (squares: Square[]) => (squares.length ? squares.map(pieceAt).join(' ') : t('app.none'))
  return `${squareName(square)}: ☗ ${list(cell.s)} · ☖ ${list(cell.g)}${contestNote(t, cell)}`
}

function stampOf(
  assist: boolean,
  review: MoveReview | null,
  reviewedMove: string | undefined,
  lastMove: string | undefined,
  bookLast: BookHit | null,
): { square: string; text: string; color: string } | null {
  if (!assist) return null
  if (review && reviewedMove) return { square: reviewedMove.slice(2, 4), text: LABELS[review.label].symbol, color: LABELS[review.label].color }
  if (lastMove && bookLast) return { square: lastMove.slice(2, 4), text: '本', color: '#a88865' }
  return null
}

function buildArrows(t: TFunction, session: BoardSession, input: DecorInput, focusSquare: Square | null, focusCell: ControlCell | null) {
  const { preview, gameOver, cursor, mode, ai, assist } = session
  const { analysis, showBest, tab, spoilerFree, modeArrows, review, reviewAt, reply, upcoming, hoverLane } = input
  const arrows: BoardArrow[] = []
  const best = analysis?.candidates[0]
  if (!gameOver && ai && assist && best && showBest && !spoilerFree && (mode === 'analyze' || mode === 'view' || tab === 'engine')) {
    for (const c of analysis!.candidates.slice(1)) if (c.move !== best.move) arrows.push({ usi: c.move, color: SHU, dashed: true })
    arrows.push({ usi: best.move, color: SHU, label: t('app.best') })
  }
  arrows.push(...modeArrows)
  if (assist && review && isWeak(review.label) && tab === 'coach' && review.reply && reviewAt === cursor && !preview)
    arrows.push({ usi: review.reply.move, color: REFUTE_BLUE })
  if (reply) arrows.push({ usi: reply.usi, color: REPLY_BLUE })
  if (preview && upcoming) arrows.push({ usi: upcoming, color: REPLY_BLUE })
  if (hoverLane && !preview && tab === 'flow') arrows.push({ usi: hoverLane, color: LANE_AMBER })
  if (focusSquare && focusCell) {
    arrows.length = 0
    for (const sq of focusCell.s) arrows.push({ usi: `${sq.usi}${focusSquare.usi}`, color: SENTE_BLUE })
    for (const sq of focusCell.g) arrows.push({ usi: `${sq.usi}${focusSquare.usi}`, color: GOTE_RED })
  }
  return arrows
}

function peekOf(t: TFunction, session: BoardSession, input: DecorInput, peekSquare: Square | null) {
  const { position, sfen, mode, course, userSide } = session
  const { showEscape, level } = input
  const enemyColor = enemyColorOf(mode, course, position, userSide)
  const enemyKing = showEscape && mode === 'tsume' ? kingSquare(sfen, enemyColor) : null
  let peekTargets: Square[] = []
  if (peekSquare) peekTargets = sees(sfen, peekSquare).filter((sq) => level !== 'new' || position.board.at(sq)?.color !== position.board.at(peekSquare)?.color)
  else if (enemyKing) peekTargets = reachable(sfen, enemyKing)
  const peekNote = peekNoteOf(t, position, level, peekSquare, peekTargets, enemyKing, enemyColor)
  return { enemyKing, peekTargets, peekNote }
}

function castlesOf({ position, sfens, game, cursor }: BoardSession, language: string) {
  return [Color.BLACK, Color.WHITE].flatMap((color) => {
    const f = formationOf(position, color, { sfens, moves: game.moves, cursor, detectionPreset: game.detectionPreset })
    return f.castle && f.castle !== '居玉' && f.squares.length
      ? [{ squares: f.squares, color: color === Color.BLACK ? '#b8432f' : '#2f5d9b', label: formationName(f.castle, language) }]
      : []
  })
}

function focusOf(position: Position, peekFrom: Square | null, control: ReturnType<typeof controlMap>) {
  const occupied = !!peekFrom && !!position.board.at(peekFrom)
  const peekSquare = occupied ? peekFrom : null
  const focusSquare = peekFrom && !occupied ? peekFrom : null
  const focusCell: ControlCell | null = focusSquare ? (control.get(focusSquare.usi) ?? EMPTY_CELL) : null
  return { peekSquare, focusSquare, focusCell }
}

function heatOf(showControl: boolean, control: ReturnType<typeof controlMap>, focusSquare: Square | null, focusCell: ControlCell | null) {
  return [...(showControl ? controlHeat(control) : []), ...(focusSquare && focusCell ? [focusHeat(focusSquare, focusCell)] : [])]
}

function checkHelpOf(t: TFunction, { position, mode, userTurn, atEnd, gameOver, preview }: BoardSession) {
  return mode === 'spar' && position.checked && userTurn && atEnd && !gameOver && !preview ? t('app.checkYourKingIsAttacked') : null
}

function noteOf(t: TFunction, input: DecorInput, session: BoardSession, focusNote: string | null, peekNote: string | null) {
  const { nudge, checking, tesujiNote } = input
  if (nudge !== null) return nudge
  if (checking) return t('app.checkingThatMove')
  const tesujiText = tesujiNote ? t('app.tesuji2', { ja: tesujiNote.ja, en: tesujiNote.en, explain: tesujiNote.explain }) : null
  return focusNote ?? peekNote ?? tesujiText ?? checkHelpOf(t, session)
}

export function useBoardDecor(session: BoardSession, input: DecorInput) {
  const { t, i18n } = useTranslation()
  const { position, sfen, preview, game, peekFrom, assist, lastMove } = session
  const { review, reviewAt, showControl, bookLast } = input

  const control = useMemo(() => controlMap(sfen, position), [sfen, position])
  const { peekSquare, focusSquare, focusCell } = focusOf(position, peekFrom, control)
  const heat = heatOf(showControl, control, focusSquare, focusCell)
  const arrows = buildArrows(t, session, input, focusSquare, focusCell)
  const { enemyKing, peekTargets, peekNote } = peekOf(t, session, input, peekSquare)
  const note = noteOf(t, input, session, focusNoteOf(t, position, focusSquare, focusCell), peekNote)
  const castles = castlesOf(session, i18n.language)
  const reviewedMove = !preview && reviewAt > 0 ? game.moves[reviewAt - 1] : undefined
  const stamp = stampOf(assist, review, reviewedMove, lastMove, bookLast)

  return {
    arrows,
    heat,
    peekTargets,
    peekFrom: peekSquare ?? enemyKing,
    note,
    castles,
    stamp,
    checkSquare: position.checked ? kingSquare(sfen, position.color) : null,
  }
}
