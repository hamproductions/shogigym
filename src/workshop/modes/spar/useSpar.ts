import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { reviewMove } from '../../../analysis'
import { saveMistakes } from '../../../mistakes'
import { applyUsi, colorSide, hasLegalMove, positionOf } from '../../../shogi'
import type { BoardSession } from '../../hooks/useBoardSession'
import type { Mistakes } from '../../hooks/useMistake'
import type { CoachReview } from '../../hooks/useMoveReview'
import type { Load } from '../../hooks/useModeSwitch'
import { isBad } from '../../lib/mistake'
import { sideMark } from '../../lib/notation'
import { cachedReview, rememberReview } from '../../memory'
import { removeBranch } from '../../tree'
import type { Confirm, Tab } from '../../types'
import { useGameClock } from './useGameClock'

type SparDeps = {
  load: Load
  setTab: (tab: Tab) => void
  coach: CoachReview
  mistakes: Mistakes
  setNudge: (text: string) => void
  setConfirm: (confirm: Confirm) => void
  forgetReply: () => void
  openInAnalyze: (title: string, autoRate: string) => void
  analyzeMoves: () => number
}

export function useSpar(session: BoardSession, { load, setTab, coach, mistakes, setNudge, setConfirm, forgetReply, openInAnalyze, analyzeMoves }: SparDeps) {
  const { t } = useTranslation()
  const { mode, game, sfens, cursor, userSide, atEnd, toMove, gameOver, ai, position, userTurn } = session
  const [resigned, setResigned] = useState(false)
  const [endHidden, setEndHidden] = useState('')
  const [newGameOpen, setNewGameOpen] = useState(false)
  const askedNewGame = useRef(false)
  const clock = useGameClock({ enabled: mode === 'spar', toMove, atEnd, moveCount: game.moves.length, stopped: resigned || gameOver })
  const { review, reviewAt } = coach

  useEffect(() => {
    if (mode !== 'spar') {
      askedNewGame.current = false
      return
    }
    if (!askedNewGame.current && game.moves.length === 0) setNewGameOpen(true)
    askedNewGame.current = true
  }, [mode, game.moves.length])

  useEffect(() => {
    if (mode !== 'spar' || !ai || !atEnd || game.moves.length === 0) return
    const n = game.moves.length
    const before = sfens[n - 1]
    const usi = game.moves[n - 1]
    if (!before || colorSide(positionOf(before).color) === userSide || cachedReview(before, usi)) return
    const timer = setTimeout(() => {
      reviewMove(before, usi, { movetime: 400 })
        .then((r) => rememberReview(before, usi, r))
        .catch(() => undefined)
    }, 1500)
    return () => clearTimeout(timer)
  }, [mode, ai, atEnd, game.moves, sfens, userSide])

  useEffect(() => {
    if (mode !== 'spar' || !review || reviewAt === 0 || !isBad(review.label)) return
    const before = sfens[reviewAt - 1]
    const usi = game.moves[reviewAt - 1]
    if (!before || !usi || colorSide(positionOf(before).color) !== userSide) return
    const added = saveMistakes([{ id: `${before}|${usi}`, sfen: before, played: usi, best: review.best.move, bestPv: review.best.pv, label: review.label, reasons: review.reasons, game: t('workshop.yourGameVsTheAi'), ply: reviewAt }])
    if (added) setNudge(t('workshop.savedToReviewYouWill'))
  }, [review, reviewAt, mode, userSide, sfens, game.moves, t, setNudge])

  const lastUserMove = (() => {
    for (let i = Math.min(cursor, game.moves.length) - 1; i >= 0; i--) if (sfens[i] && colorSide(positionOf(sfens[i]).color) === userSide) return i
    return -1
  })()

  const takeBack = () => {
    if (lastUserMove < 0) return
    forgetReply()
    session.setPlaying(false)
    session.setSelection(null)
    mistakes.setMistake(null)
    session.setTree((tr) => removeBranch(tr, game.moves.slice(0, lastUserMove + 1)))
    session.truncate(lastUserMove)
    setNudge(t('workshop.takeBackYourLastMove'))
  }

  const reviewGame = () => {
    const { moves, start } = game
    let at = start
    let first = 0
    for (let i = 0; i < moves.length && !first; i++) {
      const label = cachedReview(at, moves[i])?.label
      if (label && isBad(label)) first = i + 1
      at = applyUsi(at, moves[i]) ?? at
    }
    const run = () => {
      load(start, userSide, 'analyze', null)
      session.setGame({ start, moves })
      session.setCursor(first)
      openInAnalyze(t('workshop.yourGameVsTheAi'), moves.join(' '))
      setTab('moves')
    }
    const open = analyzeMoves()
    if (open > 0) setConfirm({ text: t('workshop.openThisGameInAnalyze', { count: open }), run, yes: t('workshop.openIt'), no: t('workshop.cancel') })
    else run()
  }

  const instruction = () => (resigned ? t('workshop.youResignedReviewTheGame') : position.checked && !hasLegalMove(position) ? t('workshop.checkmateTheGameIsOver') : !atEnd ? t('workshop.lookingBackAtEarlierMoves') : userTurn ? (position.checked ? t('workshop.checkYourKingIsIn') : t('workshop.yourMove')) : t('workshop.theAiIsThinking'))

  return {
    resigned,
    restoreResigned: () => setResigned(true),
    confirmResign: () => setConfirm({ text: t('workshop.resignThisGameYouCan'), run: () => setResigned(true), yes: t('workshop.resign2'), no: t('workshop.keepPlaying') }),
    flagged: clock.flagged,
    halted: resigned || (mode === 'spar' && !!clock.flagged),
    clockFace: clock.face,
    endHidden,
    setEndHidden,
    newGameOpen,
    setNewGameOpen,
    lastUserMove,
    takeBack,
    reviewGame,
    title: t('workshop.vsAi', { side: sideMark(userSide) }),
    instruction,
    reset: () => {
      setResigned(false)
      clock.reset()
    },
  }
}

export type Spar = ReturnType<typeof useSpar>
