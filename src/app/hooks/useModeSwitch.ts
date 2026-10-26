import { useCallback, useLayoutEffect, useRef } from 'react'
import { InitialPositionSFEN } from 'tsshogi'
import type { Course } from '@/utils/model'
import type { Side } from '@/utils/shogi'
import type { Tree } from '@/app/tree'
import type { Game, LessonMode, Mode, Score, Tab } from '@/app/types'
import type { BoardSession } from './useBoardSession'
import type { Mistakes } from './useMistake'
import type { Lesson } from '@/app/modes/lesson/useLesson'
import type { Drill } from '@/app/modes/drill/useDrill'
import type { Mistake } from '@/utils/mistakes'
import { ORIGIN_KEY, store } from '@/app/modes/lesson/reading'
import type { Tsume } from '@/app/modes/tsume/useTsume'
import type { TesujiTrainer } from '@/app/modes/tesuji/useTesuji'
import type { AiEnd, Spar } from '@/app/modes/spar/useSpar'
import type { AnalyzeGames } from '@/app/modes/analyze/useAnalyzeGames'
import type { SparGame } from '@/appearance/settings'
import type { Layout } from './useLayout'

export type Load = (start: string, side: Side, mode: Mode, course: Course | null) => void
export type Snapshot = {
  game: Game
  cursor: number
  userSide: Side
  flipped: boolean
  course: Course | null
  lessonMode: LessonMode
  score: Score
  lessonAttempts?: { answered: string[]; missed: string[]; shown?: string[] }
  tree?: Tree
  resigned?: boolean
  aiEnded?: AiEnd
  sparGame?: SparGame
}
type Snapshots = Partial<Record<Mode, Snapshot>>

const RESUMABLE: Mode[] = ['spar', 'analyze', 'lesson']

export function useModeSlots() {
  const loader = useRef<Load>(() => undefined)
  const snapshots = useRef<Snapshots>({})
  const load = useCallback<Load>((start, side, mode, course) => loader.current(start, side, mode, course), [])
  const setLoader = useCallback((impl: Load) => {
    loader.current = impl
  }, [])
  const stash = useCallback((mode: Mode, snapshot: Snapshot) => {
    snapshots.current[mode] = snapshot
  }, [])
  const stashed = useCallback((mode: Mode) => snapshots.current[mode], [])
  return { load, setLoader, stash, stashed }
}

export type ModeSlots = ReturnType<typeof useModeSlots>

type Modes = {
  session: BoardSession
  lesson: Lesson
  drill: Drill
  tsume: Tsume
  tesuji: TesujiTrainer
  spar: Spar
  analyze: AnalyzeGames
  mistakes: Mistakes
  layout: Layout
  setTab: (tab: Tab) => void
}

export function useModeSwitch(
  { load, setLoader, stash, stashed }: ModeSlots,
  { session, lesson, drill, tsume, tesuji, spar, analyze, mistakes, setTab }: Modes,
) {
  const { mode, game, cursor, userSide, flipped, course, tree, preview } = session

  const snapshot = (): Snapshot => ({
    game,
    cursor,
    userSide,
    flipped,
    course,
    lessonMode: lesson.lessonMode,
    score: lesson.score,
    lessonAttempts: lesson.attempts(),
    tree,
    resigned: spar.resigned,
    aiEnded: spar.aiEnded ?? undefined,
    sparGame: mode === 'spar' ? spar.config : undefined,
  })

  useLayoutEffect(() => {
    setLoader((start, side, nextMode, nextCourse) => {
      if (nextMode !== mode && RESUMABLE.includes(mode)) stash(mode, snapshot())
      session.reset(start, side, nextMode, nextCourse)
      analyze.forgetSlot()
      spar.reset()
      lesson.reset()
      mistakes.setMistake(null)
    })
  })

  const resume = (m: Mode, back: Snapshot) => {
    load(back.game.start, back.userSide, m, back.course)
    session.setGame(back.game)
    session.setCursor(back.cursor)
    session.setFlipped(back.flipped)
    lesson.restore(back)
    if (back.tree) session.setTree(back.tree)
    if (m === 'spar' && back.sparGame) spar.restoreConfig(back.sparGame)
  }

  const enterMode = (m: Mode, practice?: Mistake[]) => {
    store(ORIGIN_KEY, null)
    if (m === mode && m === 'lesson' && course && !preview) return lesson.leave()
    if (m === mode && !practice) return
    if (mode !== 'view' && m !== mode) stash(mode, snapshot())
    tsume.setShowEscape(false)
    session.setPeekFrom(null)
    setTab('coach')
    const back = stashed(m)
    if (back && (m === 'spar' || m === 'analyze' || (m === 'lesson' && back.course))) {
      resume(m, back)
      if (back.resigned) spar.restoreResigned()
      if (back.aiEnded) spar.endByAi(back.aiEnded)
      return
    }
    if (m === 'tesuji') return tesuji.startDefault()
    if (m === 'tsume') return tsume.startDefault()
    if (m === 'drill') return practice ? drill.practice(practice, mode) : drill.startDefault()
    if (m === 'lesson') return lesson.leave()
    load(InitialPositionSFEN.STANDARD, 'sente', m, null)
  }

  return { enterMode, resume }
}
