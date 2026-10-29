import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BoardArrow } from '@/rendering/Board3D'
import type { BoardSession } from '@/app/hooks/useBoardSession'
import type { Mistakes } from '@/app/hooks/useMistake'
import type { Load } from '@/app/hooks/useModeSwitch'
import {
  attackerOf,
  defenderMove,
  judgeTsumeMove,
  loadTsumeHistory,
  loadTsumeStats,
  markTsume,
  pickProblem,
  problemById,
  recordTsumeAttempt,
  type Problem,
  type TsumeResult,
} from '@/app/practice'
import { playSound } from '@/appearance/settings'
import type { Tab } from '@/app/types'
import { useLatest } from '@/app/hooks/useLatest'
import { applyUsi, moveText } from '@/utils/shogi'

export type TsumeLength = number | 'all'
export type TsumeState = {
  problem: Problem
  onBook: boolean
  status: 'playing' | 'checking' | 'solved' | 'wrong' | 'shown'
  reason?: string
  hint: number
  length: TsumeLength
  good: number
  missed?: boolean
  seen?: boolean
  startedAt: number
  endedAt?: number
  recorded?: boolean
  wrongUsi?: string
  refute?: boolean
  reply?: string
  wrongPly?: number
  wrongOnBook?: boolean
  wrongGood?: number
  pausedAt?: number
}

const HINT_YELLOW = '#d4a017'
export function useTsume(session: BoardSession, { mistakes, load, setTab }: { mistakes: Mistakes; load: Load; setTab: (tab: Tab) => void }) {
  const { t } = useTranslation()
  const { mode, atEnd, cursor, toMove, userSide, game, liveSfen, sfen, play } = session
  const [tsume, setTsume] = useState<TsumeState | null>(null)
  const [showEscape, setShowEscape] = useState(false)
  const [history, setHistory] = useState(loadTsumeHistory)
  const attempt = useRef(0)
  const [paused, setPaused] = useState(false)
  const playLatest = useLatest(play)
  const modeNow = useLatest(mode)
  const finish = (current: TsumeState, result: TsumeResult): Partial<TsumeState> => {
    const now = Date.now()
    if (!current.recorded)
      setHistory(recordTsumeAttempt({ id: current.problem.id, mate: current.problem.mate, result, ms: (current.pausedAt ?? now) - current.startedAt, at: now }))
    return { recorded: true, endedAt: now }
  }

  useEffect(() => {
    if (mode !== 'tsume' || paused || !tsume || tsume.status !== 'playing' || !atEnd || cursor === 0 || toMove === userSide) return
    let cancelled = false
    const timer = setTimeout(async () => {
      const usi = await defenderMove(tsume.problem, game.moves, liveSfen, tsume.onBook)
      if (!cancelled && usi) play(usi)
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [mode, paused, tsume, atEnd, cursor, toMove, userSide, game.moves, liveSfen, play])

  const begin = (problem: Problem, length: TsumeLength) => {
    attempt.current++
    setPaused(false)
    load(problem.sfen, attackerOf(problem), 'tsume', null)
    setTsume({ problem, onBook: true, status: 'playing', hint: 0, length, good: 0, startedAt: Date.now() })
  }

  const start = (length: TsumeLength, exclude?: string) => {
    const token = ++attempt.current
    const requested = modeNow.current
    pickProblem(length, exclude).then(
      (problem) => {
        if (token !== attempt.current || modeNow.current !== requested) return
        begin(problem, length)
        setTab('coach')
      },
      (error) => console.warn('tsume problems not loaded', error),
    )
  }
  const startDefault = () => start(tsume?.length ?? (loadTsumeStats().solved.length < 5 ? 1 : 3))

  const judge = async (current: TsumeState, usi: string) => {
    const token = attempt.current
    setTsume({ ...current, status: 'checking', reason: undefined, refute: undefined, reply: undefined })
    play(usi)
    const verdict = await judgeTsumeMove(current.problem, game.moves.slice(0, cursor), sfen, usi, current.onBook)
    if (token !== attempt.current) return
    if (verdict.kind === 'solved') {
      const clean = !(current.hint >= 2 || current.missed)
      markTsume(current.problem.id, clean ? 'solved' : 'failed')
      const done = finish(current, clean ? 'solved' : 'failed')
      setTsume((prev) => prev && { ...prev, status: 'solved', ...done })
      playSound('complete')
    } else if (verdict.kind === 'wrong') {
      markTsume(current.problem.id, 'failed')
      playSound('wrong')
      const ply = cursor
      const recorded = finish(current, 'failed')
      setTsume(
        (prev) =>
          prev && {
            ...prev,
            ...recorded,
            endedAt: undefined,
            status: 'wrong',
            missed: true,
            reason: verdict.reason,
            wrongUsi: usi,
            refute: verdict.refute,
            reply: verdict.reply && moveText(applyUsi(sfen, usi) ?? sfen, verdict.reply),
            wrongPly: ply,
            wrongOnBook: current.onBook,
            wrongGood: current.good,
          },
      )
      if (verdict.reply) {
        const reply = verdict.reply
        setTimeout(() => token === attempt.current && playLatest.current(reply), 250)
      }
    } else setTsume((prev) => prev && { ...prev, status: 'playing', reason: undefined, onBook: current.onBook && !verdict.offBook, good: current.good + 1 })
  }

  const commit = (usi: string) => {
    if (!tsume || paused || tsume.status !== 'playing' || toMove !== userSide) return
    void judge(tsume, usi)
  }

  const update = (patch: Partial<TsumeState>) => tsume && setTsume({ ...tsume, ...patch })
  const next = () => {
    if (!tsume) return
    if (!tsume.recorded) {
      markTsume(tsume.problem.id, 'failed')
      finish(tsume, 'failed')
    }
    start(tsume.length, tsume.problem.id)
  }
  const retry = () => {
    if (!tsume) return
    attempt.current++
    load(tsume.problem.sfen, attackerOf(tsume.problem), 'tsume', null)
    setTsume({
      ...tsume,
      status: 'playing',
      onBook: true,
      good: 0,
      hint: tsume.status === 'shown' ? 0 : tsume.hint,
      reason: undefined,
      startedAt: Date.now(),
      endedAt: undefined,
      pausedAt: undefined,
    })
    setPaused(false)
  }
  const hint = () => update({ hint: (tsume?.hint ?? 0) + 1 })
  const tryAgain = () => {
    if (tsume?.status !== 'wrong' || tsume.wrongPly === undefined) return
    attempt.current++
    session.truncate(tsume.wrongPly)
    setTsume({ ...tsume, status: 'playing', onBook: tsume.wrongOnBook ?? true, good: tsume.wrongGood ?? 0 })
  }
  const togglePause = () => {
    if (!tsume) return
    const now = Date.now()
    if (paused)
      setTsume({ ...tsume, startedAt: tsume.endedAt === undefined ? tsume.startedAt + (now - (tsume.pausedAt ?? now)) : tsume.startedAt, pausedAt: undefined })
    else setTsume({ ...tsume, pausedAt: now })
    setPaused(!paused)
  }
  const reveal = () => {
    if (!tsume) return
    attempt.current++
    markTsume(tsume.problem.id, 'failed')
    mistakes.setMistake(null)
    session.setPreview(null)
    session.setGame({ start: tsume.problem.sfen, moves: tsume.problem.pv })
    session.setCursor(tsume.problem.pv.length)
    setTsume({ ...tsume, status: 'shown', hint: 2, seen: true, ...finish(tsume, 'shown') })
  }
  const solvedText = (state: TsumeState) =>
    `✓ ${t(state.seen ? 'tsume.mateSolvedAfterSeeingThe' : state.hint >= 2 ? 'tsume.mateSolvedAfterTheFirst' : state.missed ? 'tsume.mateSolvedOnASecond' : 'tsume.mateSolved')}`
  const open = (id: string) => {
    const problem = problemById(id)
    if (problem) begin(problem, tsume?.length ?? problem.mate)
  }

  useEffect(() => {
    if (mode !== 'tsume') return
    let hiddenAt = 0
    const on = () => {
      if (document.hidden) hiddenAt = Date.now()
      else if (hiddenAt) {
        const away = Date.now() - hiddenAt
        hiddenAt = 0
        setTsume((current) =>
          current && current.endedAt === undefined && current.pausedAt === undefined ? { ...current, startedAt: current.startedAt + away } : current,
        )
      }
    }
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [mode])

  const takeBack = useLatest(tryAgain)
  const replyShown = !tsume?.reply || (tsume.wrongPly !== undefined && cursor === tsume.wrongPly + 2 && session.landing === null)
  const wrongKey =
    mode === 'tsume' && !paused && tsume?.status === 'wrong' ? `${tsume.wrongUsi}|${!tsume.reply ? 'plain' : replyShown ? 'shown' : 'waiting'}` : null
  useEffect(() => {
    if (!wrongKey) return
    const delay = wrongKey.endsWith('plain') ? 700 : wrongKey.endsWith('shown') ? 1500 : 3000
    const timer = setTimeout(() => takeBack.current(), delay)
    return () => clearTimeout(timer)
  }, [wrongKey, takeBack])

  const solvedKey = mode === 'tsume' && !paused && tsume?.status === 'solved' && session.landing === null ? tsume.problem.id : null
  const advance = useLatest(next)
  useEffect(() => {
    if (!solvedKey) return
    const timer = setTimeout(() => advance.current(), 1200)
    return () => clearTimeout(timer)
  }, [solvedKey, advance])

  const keys = useLatest({ next, retry, tryAgain, hint, reveal, tsume })
  useEffect(() => {
    if (mode !== 'tsume') return
    const on = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target instanceof Element && e.target.closest('input, textarea, select, button, a, [contenteditable]')))
        return
      const { tsume: current, next, retry, tryAgain, hint, reveal } = keys.current
      if (!current) return
      const key = e.key.toLowerCase()
      const action =
        key === 'n' || (key === 'enter' && (current.status === 'solved' || current.status === 'shown'))
          ? next
          : key === 'r'
            ? current.status === 'wrong'
              ? tryAgain
              : retry
            : key === 'i' && current.status === 'playing'
              ? hint
              : key === 's' && (current.status === 'playing' || current.status === 'wrong')
                ? reveal
                : null
      if (!action) return
      e.preventDefault()
      action()
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [mode, keys])

  return {
    tsume,
    restore: begin,
    showEscape,
    setShowEscape,
    toggleEscape: () => {
      session.setPeekFrom(null)
      setShowEscape((v) => !v)
    },
    hidesAnswer: mode === 'tsume' && tsume?.status !== 'solved' && tsume?.status !== 'shown',
    arrows: (mode === 'tsume' && tsume && tsume.hint >= 2 && cursor === 0 ? [{ usi: tsume.problem.pv[0], color: HINT_YELLOW }] : []) as BoardArrow[],
    title: tsume ? t('app.tsumeMateIn', { mate: tsume.problem.mate }) : null,
    instruction: () => t('app.everyAttackingMoveMustGive'),
    start,
    startDefault,
    next,
    retry,
    hint,
    reveal,
    tryAgain,
    paused,
    togglePause,
    solvedText,
    open,
    history,
    resume: () => mode === 'tsume' && update({ status: 'playing' }),
    commit,
  }
}

export type Tsume = ReturnType<typeof useTsume>
