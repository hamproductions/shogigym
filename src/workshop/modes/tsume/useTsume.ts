import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BoardArrow } from '../../Board3D'
import type { BoardSession } from '../../hooks/useBoardSession'
import type { Mistakes } from '../../hooks/useMistake'
import type { Load } from '../../hooks/useModeSwitch'
import { sideMark } from '../../lib/notation'
import { attackerOf, defenderMove, judgeTsumeMove, loadTsumeStats, markTsume, pickProblem, type Problem } from '../../practice'
import { playSound } from '../../settings'
import type { Tab } from '../../types'

export type TsumeLength = number | 'all'
export type TsumeState = { problem: Problem; onBook: boolean; status: 'playing' | 'checking' | 'solved' | 'wrong' | 'shown'; reason?: string; hint: number; length: TsumeLength; good: number; missed?: boolean; seen?: boolean }

const HINT_YELLOW = '#d4a017'

export function useTsume(session: BoardSession, { mistakes, load, setTab }: { mistakes: Mistakes; load: Load; setTab: (tab: Tab) => void }) {
  const { t } = useTranslation()
  const { mode, atEnd, cursor, toMove, userSide, game, liveSfen, sfen, play } = session
  const [tsume, setTsume] = useState<TsumeState | null>(null)
  const [showEscape, setShowEscape] = useState(false)

  useEffect(() => {
    if (mode !== 'tsume' || !tsume || tsume.status !== 'playing' || !atEnd || cursor === 0 || toMove === userSide) return
    let cancelled = false
    const timer = setTimeout(async () => {
      const usi = await defenderMove(tsume.problem, game.moves, liveSfen, tsume.onBook)
      if (!cancelled && usi) play(usi)
    }, 600)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [mode, tsume, atEnd, cursor, toMove, userSide, game.moves, liveSfen, play])

  const begin = (problem: Problem, length: TsumeLength) => {
    load(problem.sfen, attackerOf(problem), 'tsume', null)
    setTsume({ problem, onBook: true, status: 'playing', hint: 0, length, good: 0 })
  }

  const start = (length: TsumeLength, exclude?: string) => {
    begin(pickProblem(length, exclude), length)
    setTab('coach')
  }
  const startDefault = () => start(tsume?.length ?? (loadTsumeStats().solved.length < 5 ? 1 : 3))

  const judge = async (current: TsumeState, usi: string) => {
    setTsume({ ...current, status: 'checking' })
    const verdict = await judgeTsumeMove(current.problem, game.moves.slice(0, cursor), sfen, usi, current.onBook)
    play(usi)
    if (verdict.kind === 'solved') {
      markTsume(current.problem.id, current.hint >= 2 || current.missed ? 'failed' : 'solved')
      setTsume({ ...current, status: 'solved' })
      playSound('complete')
    } else if (verdict.kind === 'wrong') {
      markTsume(current.problem.id, 'failed')
      setTsume({ ...current, status: 'wrong', reason: verdict.reason, missed: true })
      session.truncate(cursor)
      await mistakes.show(usi, current.problem.pv[cursor] ?? usi, undefined, verdict.reason)
    } else setTsume({ ...current, status: 'playing', onBook: current.onBook && !verdict.offBook, good: current.good + 1 })
  }

  const commit = (usi: string) => {
    if (!tsume || tsume.status !== 'playing' || toMove !== userSide) return
    void judge(tsume, usi)
  }

  const update = (patch: Partial<TsumeState>) => tsume && setTsume({ ...tsume, ...patch })

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
    title: tsume ? t('workshop.tsumeMateIn', { mate: tsume.problem.mate }) : null,
    instruction: () => (tsume ? t('workshop.toPlayMateInEvery', { side: sideMark(attackerOf(tsume.problem)), mate: tsume.problem.mate }) : t('workshop.everyAttackingMoveMustGive')),
    start,
    startDefault,
    next: () => tsume && start(tsume.length, tsume.problem.id),
    retry: () => {
      if (!tsume) return
      load(tsume.problem.sfen, attackerOf(tsume.problem), 'tsume', null)
      setTsume({ ...tsume, status: 'playing', onBook: true, good: 0 })
    },
    hint: () => update({ hint: (tsume?.hint ?? 0) + 1 }),
    reveal: () => {
      if (!tsume) return
      markTsume(tsume.problem.id, 'failed')
      session.setGame({ start: tsume.problem.sfen, moves: tsume.problem.pv })
      session.setCursor(tsume.problem.pv.length)
      setTsume({ ...tsume, status: 'shown', hint: 2, seen: true })
    },
    resume: () => mode === 'tsume' && update({ status: 'playing', onBook: true, good: 0 }),
    commit,
  }
}

export type Tsume = ReturnType<typeof useTsume>
