import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Color, PieceType, Square } from 'tsshogi'
import { legalTargets, promotionOptions } from '../../shogi'
import { sideMark } from '../lib/notation'
import { sees } from '../pieces'
import type { LessonMode } from '../types'
import type { BoardSession } from './useBoardSession'
import type { Mistakes } from './useMistake'

type BoardInputDeps = { mistakes: Mistakes; commit: (usi: string) => void; lessonMode: LessonMode; halted: boolean; setNudge: (text: string) => void }

export function useBoardInput(session: BoardSession, { mistakes, commit, lessonMode, halted, setNudge }: BoardInputDeps) {
  const { t } = useTranslation()
  const { mode, course, preview, atEnd, selection, setSelection, position, sfen, peekFrom, setPeekFrom, setPreview, setPlaying, userTurn, setPromotion } = session
  const canMove = (userTurn && !(mode === 'spar' && halted)) || (mode === 'lesson' && !!course && lessonMode === 'study' && !preview)
  const targets = useMemo(() => (selection ? legalTargets(position, selection.from) : []), [selection, position])
  const picking = mode === 'lesson' && !course
  const dropStaleMistake = () => {
    if (mistakes.mistake && !preview) mistakes.setMistake(null)
  }

  const attempt = (from: Square | PieceType, to: Square) => {
    const options = promotionOptions(position, from, to)
    if (options.length === 0) return setSelection(null)
    if (options.length === 1) return commit(options[0].usi)
    setPromotion(options)
  }

  const onSquare = (square: Square) => {
    setPlaying(false)
    if (preview) return setPreview(null)
    if (!atEnd && (mode === 'tsume' || mode === 'drill')) return
    if (selection && targets.some((sq) => sq.equals(square))) return attempt(selection.from, square)
    const piece = position.board.at(square)
    if (selection?.from instanceof Square && piece?.color !== selection.color && sees(sfen, selection.from).some((sq) => sq.equals(square))) {
      setSelection(null)
      setNudge(position.board.at(selection.from)?.type === PieceType.KING ? t('workshop.yourKingCannotGoThere') : t('workshop.thatMoveWouldLeaveYour'))
      return
    }
    if (picking) return setPeekFrom(piece && !(peekFrom && peekFrom.equals(square)) ? square : null)
    if (selection?.from instanceof Square && selection.from.equals(square)) return setSelection(null)
    if (piece && piece.color === position.color && canMove) {
      setPeekFrom(null)
      dropStaleMistake()
      return setSelection({ from: square, color: piece.color })
    }
    setSelection(null)
    if (piece && piece.color !== position.color && (mode === 'drill' || mode === 'tsume' || (mode === 'lesson' && lessonMode === 'quiz')) && userTurn) {
      setNudge(t('workshop.thatIsTheOpponentS', { side: sideMark(position.color) }))
      return
    }
    setPeekFrom(peekFrom && peekFrom.equals(square) ? null : square)
  }

  const onHand = (color: Color, type: PieceType) => {
    if (preview) return setPreview(null)
    if (picking) return
    if (color !== position.color || !canMove) return
    if (selection && !(selection.from instanceof Square) && selection.from === type) return setSelection(null)
    dropStaleMistake()
    setSelection({ from: type, color })
  }

  const onDrop = (from: Square | PieceType, to: Square) => {
    if (preview) return setPreview(null)
    if (picking || !canMove) return setSelection(null)
    attempt(from, to)
  }

  const cancelPromotion = () => {
    setPromotion(null)
    setSelection(null)
  }

  return { targets, onSquare, onHand, onDrop, cancelPromotion }
}
