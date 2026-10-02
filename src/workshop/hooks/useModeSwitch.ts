import { useCallback, useLayoutEffect, useRef } from 'react'
import { InitialPositionSFEN } from 'tsshogi'
import type { Course } from '../../model'
import type { Side } from '../../shogi'
import type { Tree } from '../tree'
import type { Game, LessonMode, Mode, Score, Tab } from '../types'
import type { BoardSession } from './useBoardSession'
import type { Mistakes } from './useMistake'
import type { Lesson } from '../modes/lesson/useLesson'
import type { Drill } from '../modes/drill/useDrill'
import type { Tsume } from '../modes/tsume/useTsume'
import type { TesujiTrainer } from '../modes/tesuji/useTesuji'
import type { Spar } from '../modes/spar/useSpar'
import type { AnalyzeGames } from '../modes/analyze/useAnalyzeGames'
import type { Layout } from './useLayout'

export type Load = (start: string, side: Side, mode: Mode, course: Course | null) => void
export type Snapshot = { game: Game; cursor: number; userSide: Side; flipped: boolean; course: Course | null; lessonMode: LessonMode; score: Score; tree?: Tree; resigned?: boolean }
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

type Modes = { session: BoardSession; lesson: Lesson; drill: Drill; tsume: Tsume; tesuji: TesujiTrainer; spar: Spar; analyze: AnalyzeGames; mistakes: Mistakes; layout: Layout; setTab: (tab: Tab) => void }

export function useModeSwitch({ load, setLoader, stash, stashed }: ModeSlots, { session, lesson, drill, tsume, tesuji, spar, analyze, mistakes, layout, setTab }: Modes) {
  const { mode, game, cursor, userSide, flipped, course, tree, preview } = session

  const snapshot = (): Snapshot => ({ game, cursor, userSide, flipped, course, lessonMode: lesson.lessonMode, score: lesson.score, tree, resigned: spar.resigned })

  useLayoutEffect(() => {
    setLoader((start, side, nextMode, nextCourse) => {
      if (nextMode !== mode && RESUMABLE.includes(mode)) stash(mode, snapshot())
      session.reset(start, side, nextMode, nextCourse)
      analyze.forgetSlot()
      spar.reset()
      lesson.reset()
      layout.setSheetOpen(null)
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
  }

  const enterMode = (m: Mode) => {
    if (m === mode && m === 'lesson' && course && !preview) return lesson.leave()
    if (m === mode) return
    stash(mode, snapshot())
    tsume.setShowEscape(false)
    session.setPeekFrom(null)
    setTab('coach')
    const back = stashed(m)
    if (back && (m === 'spar' || m === 'analyze' || (m === 'lesson' && back.course))) {
      resume(m, back)
      if (back.resigned) spar.restoreResigned()
      return
    }
    if (m === 'tesuji') return tesuji.startDefault()
    if (m === 'tsume') return tsume.startDefault()
    if (m === 'drill') return drill.startDefault()
    if (m === 'lesson') return lesson.leave()
    load(InitialPositionSFEN.STANDARD, 'sente', m, null)
  }

  return { enterMode, resume }
}
