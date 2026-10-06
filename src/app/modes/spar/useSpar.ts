import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { reviewMove } from '@/utils/analysis'
import { saveMistakes } from '@/utils/mistakes'
import { applyUsi, colorSide, hasLegalMove, positionOf } from '@/utils/shogi'
import type { BoardSession } from '@/app/hooks/useBoardSession'
import type { Mistakes } from '@/app/hooks/useMistake'
import type { CoachReview } from '@/app/hooks/useMoveReview'
import type { Load } from '@/app/hooks/useModeSwitch'
import { isBad } from '@/utils/mistake'
import { sideMark } from '@/utils/notation'
import { cachedReview, rememberReview } from '@/app/memory'
import { removeBranch } from '@/app/tree'
import type { Confirm, Tab } from '@/app/types'
import { useGameClock } from './useGameClock'

interface SparDeps {
  load: Load
  setTab: (tab: Tab) => void
  coach: CoachReview
  mistakes: Mistakes
  setNudge: (text: string) => void
  setConfirm: (confirm: Confirm) => void
  forgetReply: () => void
  openInAnalyze: (title: string, autoRate: string) => void
  preserveAnalysis: () => boolean
  paused?: boolean
  onOpenAnalyze?: () => void
}

export function useSpar(
  session: BoardSession,
  { load, setTab, coach, mistakes, setNudge, setConfirm, forgetReply, openInAnalyze, preserveAnalysis, paused = false, onOpenAnalyze }: SparDeps,
) {
  const { t } = useTranslation()
  const { mode, game, sfens, cursor, userSide, atEnd, toMove, gameOver, ai, position, userTurn } = session
  const [resigned, setResigned] = useState(false)
  const [endHidden, setEndHidden] = useState('')
  const [newGameOpen, setNewGameOpen] = useState(false)
  const [furigomaBanner, setFurigomaBanner] = useState<string | null>(null)
  const clock = useGameClock({ enabled: mode === 'spar', toMove, atEnd, moveCount: game.moves.length, stopped: paused || resigned || gameOver, userSide })
  const { review, reviewAt } = coach

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
    const added = saveMistakes([
      {
        id: `${before}|${usi}`,
        sfen: before,
        played: usi,
        best: review.best.move,
        bestPv: review.best.pv,
        label: review.label,
        reasons: review.reasons,
        game: t('app.yourGameVsTheAi'),
        ply: reviewAt,
      },
    ])
    if (added) setNudge(t('app.savedToReviewYouWill'))
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
    setNudge(t('app.takeBackYourLastMove'))
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
      if (!preserveAnalysis()) return
      load(start, userSide, 'analyze', null)
      session.setGame({ start, moves })
      session.setCursor(first)
      openInAnalyze(t('app.yourGameVsTheAi'), moves.join(' '))
      setTab('moves')
      onOpenAnalyze?.()
    }
    run()
  }

  const instruction = () =>
    resigned
      ? t('app.youResignedReviewTheGame')
      : position.checked && !hasLegalMove(position)
        ? t('app.checkmateTheGameIsOver')
        : atEnd
          ? userTurn
            ? position.checked
              ? t('app.checkYourKingIsIn')
              : t('app.yourMove')
            : t('app.theAiIsThinking')
          : t('app.lookingBackAtEarlierMoves')

  return {
    resigned,
    restoreResigned: () => setResigned(true),
    confirmResign: () => setConfirm({ text: t('app.resignThisGameYouCan'), run: () => setResigned(true), yes: t('app.resign2'), no: t('app.keepPlaying') }),
    flagged: clock.flagged,
    halted: paused || resigned || (mode === 'spar' && !!clock.flagged),
    clockFace: clock.face,
    endHidden,
    setEndHidden,
    newGameOpen,
    setNewGameOpen,
    lastUserMove,
    erred: mode === 'spar' && !resigned && !!review && reviewAt > 0 && reviewAt === lastUserMove + 1 && isBad(review.label),
    takeBack,
    reviewGame,
    title: t('app.vsAi', { side: sideMark(userSide) }),
    furigomaBanner,
    setFurigomaBanner,
    clearFurigomaBanner: () => setFurigomaBanner(null),
    instruction,
    reset: () => {
      setResigned(false)
      setFurigomaBanner(null)
      clock.reset()
    },
  }
}

export type Spar = ReturnType<typeof useSpar>
