import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { reviewMove, type Label } from '@/utils/analysis'
import { saveMistakes } from '@/utils/mistakes'
import { applyUsi, colorSide, hasLegalMove, otherSide, positionOf, type Side } from '@/utils/shogi'
import type { BoardSession } from '@/app/hooks/useBoardSession'
import type { Mistakes } from '@/app/hooks/useMistake'
import type { CoachReview } from '@/app/hooks/useMoveReview'
import type { Load } from '@/app/hooks/useModeSwitch'
import { isBad } from '@/utils/mistake'
import { sideMark } from '@/utils/notation'
import { cachedReview, rememberReview } from '@/app/memory'
import { removeBranch } from '@/app/tree'
import type { Confirm, Game, Tab } from '@/app/types'
import { getSettings, setSettings, sparGameOf, TIME_CONTROLS, type SparGame } from '@/appearance/settings'
import { useGameClock } from './useGameClock'

export type AiEnd = 'resign' | 'declare'

export function gameSummary({ start, moves }: Game, userSide: Side) {
  let at = start
  let reviewed = 0
  let bad = 0
  let firstBad: { ply: number; sfen: string; usi: string; label: Label } | null = null
  for (let i = 0; i < moves.length; i++) {
    const label = colorSide(positionOf(at).color) === userSide ? cachedReview(at, moves[i])?.label : undefined
    if (label) reviewed++
    if (label && isBad(label)) {
      bad++
      firstBad ??= { ply: i + 1, sfen: at, usi: moves[i], label }
    }
    at = applyUsi(at, moves[i]) ?? at
  }
  return { moves: moves.length, reviewed, bad, firstBad }
}

type SparDeps = {
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
  onRematch?: (side: Side, drawn: boolean) => void
}

export function useSpar(
  session: BoardSession,
  { load, setTab, coach, mistakes, setNudge, setConfirm, forgetReply, openInAnalyze, preserveAnalysis, paused = false, onOpenAnalyze, onRematch }: SparDeps,
) {
  const { t } = useTranslation()
  const { mode, game, sfens, cursor, userSide, atEnd, ai, position, userTurn, opponentMoving } = session
  const [resigned, setResigned] = useState(false)
  const [aiEnded, setAiEnded] = useState<AiEnd | null>(null)
  const [endHidden, setEndHidden] = useState('')
  const [newGame, setNewGame] = useState<{ preset: Partial<SparGame> } | null>(null)
  const [furigomaBanner, setFurigomaBanner] = useState<string | null>(null)
  const [config, setConfig] = useState(() => sparGameOf(getSettings()))
  const [coachHidden, setCoachHidden] = useState(false)
  const [drawn, setDrawn] = useState(false)
  const end = useMemo(() => positionOf(sfens[sfens.length - 1]), [sfens])
  const mated = !hasLegalMove(end)
  const liveTurn = colorSide(end.color)
  const clock = useGameClock({
    enabled: mode === 'spar',
    toMove: liveTurn,
    ticking: opponentMoving ? otherSide(userSide) : liveTurn,
    moveCount: game.moves.length,
    stopped: paused || resigned || !!aiEnded || mated,
    userSide,
    timeControl: config.timeControl,
  })
  const over = resigned || !!aiEnded || !!clock.flagged || mated
  const assist = over ? !coachHidden : config.coach === 'live'
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
    if (added && assist) setNudge(t('app.savedToReviewYouWill'))
  }, [review, reviewAt, mode, userSide, sfens, game.moves, t, setNudge, assist])

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
    const first = gameSummary(game, userSide).firstBad?.ply ?? 0
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

  const pace = ({ book, sharp }: { book: boolean; sharp: boolean }) => {
    const { main, byoyomi, increment } = clock.spec
    const between = (low: number, high: number) => low + Math.random() * (high - low)
    if (main + byoyomi === 0) return between(900, 2000)
    const left = clock.remaining(otherSide(userSide))
    const mainLeft = Math.max(0, left - byoyomi * 1000)
    const think = book
      ? between(1000, 3000)
      : (Math.min(mainLeft / 40, 6000) + (mainLeft > 0 ? 0 : Math.min(byoyomi * 300, 8000)) + increment * 1000) * between(0.7, 1.3) * (sharp ? 1.5 : 1)
    return Math.max(0, Math.min(think, left - 2000))
  }

  const instruction = () =>
    aiEnded
      ? t(aiEnded === 'resign' ? 'app.aiResignedYouWin' : 'app.aiDeclaredWin')
      : resigned
        ? t('app.youResignedReviewTheGame')
        : position.checked && !hasLegalMove(position)
          ? t('app.checkmateTheGameIsOver')
          : !atEnd
            ? over
              ? t('app.lookingBackAtEarlierMoves')
              : t('app.lookingBackDuringGame')
            : opponentMoving
              ? t('app.theAiIsThinking')
              : userTurn
                ? position.checked
                  ? t('app.checkYourKingIsIn')
                  : t('app.yourMove')
                : t('app.theAiIsThinking')

  return {
    resigned,
    over,
    restoreResigned: () => setResigned(true),
    aiEnded,
    endByAi: setAiEnded,
    aiThinking: mode === 'spar' && !over && !paused && (opponentMoving || liveTurn !== userSide),
    pace,
    confirmResign: () => setConfirm({ text: t('app.resignThisGameYouCan'), run: () => setResigned(true), yes: t('app.resign2'), no: t('app.keepPlaying') }),
    flagged: clock.flagged,
    halted: paused || resigned || !!aiEnded || (mode === 'spar' && !!clock.flagged),
    clockFace: clock.face,
    endHidden,
    setEndHidden,
    newGameOpen: !!newGame,
    newGamePreset: newGame?.preset,
    setNewGameOpen: (open: boolean, preset: Partial<SparGame> = {}) => setNewGame(open ? { preset } : null),
    openNewGame: () =>
      game.moves.length > 0 && !over ? setConfirm({ text: t('newGame.endCurrent'), run: () => setNewGame({ preset: {} }) }) : setNewGame({ preset: {} }),
    config,
    restoreConfig: setConfig,
    assist,
    toggleCoach: () => (over ? setCoachHidden((h) => !h) : setConfig((c) => ({ ...c, coach: c.coach === 'live' ? 'after' : 'live' }))),
    lastUserMove,
    erred: mode === 'spar' && assist && !resigned && !!review && reviewAt > 0 && reviewAt === lastUserMove + 1 && isBad(review.label),
    takeBack,
    reviewGame,
    summary: () => (mode === 'spar' ? gameSummary(game, userSide) : null),
    setDrawn,
    rematch: () => {
      setSettings({ opponent: config.opponent, timeControl: config.timeControl, aiStrategy: config.aiStrategy, sparCoach: config.coach })
      onRematch?.(drawn ? userSide : otherSide(userSide), drawn)
    },
    title:
      config.timeControl === 'none'
        ? t('app.vsAi', { side: sideMark(userSide) })
        : `${t('app.vsAi', { side: sideMark(userSide) })} · ${TIME_CONTROLS[config.timeControl].label}`,
    furigomaBanner,
    setFurigomaBanner,
    clearFurigomaBanner: () => setFurigomaBanner(null),
    instruction,
    reset: () => {
      setResigned(false)
      setAiEnded(null)
      setFurigomaBanner(null)
      setCoachHidden(false)
      setConfig(sparGameOf(getSettings()))
      clock.reset()
    },
  }
}

export type Spar = ReturnType<typeof useSpar>
