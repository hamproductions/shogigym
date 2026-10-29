import { useEffect, useRef, useState } from 'react'
import { Position } from 'tsshogi'
import { COURSES, loadCatalog, loadCourse } from '@/utils/model'
import type { Course } from '@/utils/model'
import { applyUsi, type Side } from '@/utils/shogi'
import { setupOf } from '@/utils/book'
import { freeAnalysisCache } from '@/app/memory'
import type { Drill } from '@/app/modes/drill/useDrill'
import type { AiEnd, Spar } from '@/app/modes/spar/useSpar'
import type { Lesson } from '@/app/modes/lesson/useLesson'
import type { Tsume, TsumeLength } from '@/app/modes/tsume/useTsume'
import { loadProblems, problemById, type ReviewQueue } from '@/app/practice'
import type { Tree } from '@/app/tree'
import type { LessonMode, Mode, Score } from '@/app/types'
import type { BoardSession } from './useBoardSession'
import type { SparGame } from '@/appearance/settings'
import type { ModeSlots, Snapshot } from './useModeSwitch'
import { useLatest } from './useLatest'

const SESSION_KEY = 'joseki-practice:session:v2'

type SavedGame = { start: string; moves: string[]; cursor: number; userSide: Side; tree?: Tree; resigned?: boolean; aiEnded?: AiEnd; sparGame?: SparGame }
type SavedSession = {
  mode: Mode
  lesson?: { courseId: string; lessonMode: LessonMode; moves: string[]; score?: Score; attempts?: Snapshot['lessonAttempts'] }
  spar?: SavedGame
  analyze?: SavedGame
  tsume?: { problemId: string; length: TsumeLength }
  drill?: { queue: ReviewQueue }
}

const readSession = () => JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as SavedSession | null

function replays(start: string, moves: string[]) {
  let at: string | null = Position.newBySFEN(start) ? start : null
  for (const usi of moves) at = at && applyUsi(at, usi)
  return !!at
}

type Persisted = {
  session: BoardSession
  lesson: Lesson
  tsume: Tsume
  drill: Drill
  spar: Spar
  slots: ModeSlots
  resume: (mode: Mode, snapshot: Snapshot) => void
}

export function usePersistedSession({ session, lesson, tsume, drill, spar, slots, resume }: Persisted) {
  const { mode, course, game, cursor, userSide, tree } = session
  const restored = useRef(false)
  const [ready, setReady] = useState(false)
  const placeholder = useRef(true)
  const modeNow = useLatest(mode)

  useEffect(() => {
    if (restored.current) return
    restored.current = true
    const data = (() => {
      try {
        return readSession()
      } catch (error) {
        console.warn('session not restored', error)
        return null
      }
    })()
    if (!data) return setReady(true)
    const requested = modeNow.current
    const apply = (lessonCourse: Course | undefined) => {
      const here = modeNow.current === requested
      let pending: Promise<unknown> | undefined
      try {
        const saved: Partial<Record<Mode, Snapshot>> = {}
        for (const m of ['spar', 'analyze'] as const) {
          const g = data[m]
          if (g && replays(g.start, g.moves))
            saved[m] = {
              game: { start: g.start, moves: g.moves },
              cursor: g.cursor,
              userSide: g.userSide,
              flipped: g.userSide === 'gote',
              course: null,
              lessonMode: 'study',
              score: { right: 0, wrong: 0 },
              tree: g.tree,
              resigned: g.resigned,
              aiEnded: g.aiEnded,
              sparGame: g.sparGame,
            }
        }
        const saw = data.lesson
        const lessonSnapshot = (c: Course | undefined): Snapshot | undefined =>
          c && saw && replays(c.root.sfen, saw.moves)
            ? {
                game: { start: c.root.sfen, moves: saw.moves },
                cursor: saw.moves.length,
                userSide: c.userSide,
                flipped: c.userSide === 'gote',
                course: c,
                lessonMode: saw.lessonMode,
                score: saw.score ?? { right: 0, wrong: 0 },
                lessonAttempts: saw.attempts,
              }
            : undefined
        const lessonNow = lessonSnapshot(lessonCourse)
        if (lessonNow) saved.lesson = lessonNow
        const into = data.mode === 'spar' || data.mode === 'analyze' || data.mode === 'lesson' ? data.mode : 'spar'
        const back = saved[into]
        if (back && here) {
          resume(into, back)
          if (back.resigned) spar.restoreResigned()
          if (back.aiEnded) spar.endByAi(back.aiEnded)
          placeholder.current = false
          if (back.course) lesson.setPickerSetup(setupOf(back.course)?.id ?? null)
        }
        const problem = here && data.mode === 'tsume' && data.tsume ? problemById(data.tsume.problemId) : undefined
        const drillQueue = here && data.mode === 'drill' ? data.drill?.queue : undefined
        if (problem) tsume.restore(problem, data.tsume!.length)
        if (drillQueue) pending = drill.start(drillQueue)
        if (problem || drillQueue) placeholder.current = false
        for (const [m, snapshot] of Object.entries(saved)) slots.stash(m as Mode, snapshot)
      } catch (error) {
        console.warn('session not restored', error)
      }
      if (pending) void pending.finally(() => setReady(true))
      else setReady(true)
    }
    const problems = data.mode === 'tsume' && data.tsume ? loadProblems() : null
    const savedId = data.lesson?.courseId
    if (!savedId && !problems) return apply(undefined)
    const savedCourse = savedId
      ? loadCatalog().then(() => {
          const course = COURSES.find((x) => x.id === savedId)
          return course && loadCourse(course)
        })
      : undefined
    Promise.all([savedCourse, problems]).then(
      ([course]) => apply(course),
      (error) => {
        console.warn('session not fully restored', error)
        apply(undefined)
      },
    )
  }, [lesson, tsume, drill, spar, slots, resume, modeNow])

  const { lessonMode, score, showAnswer, attempts } = lesson
  const problem = tsume.tsume
  const drillState = drill.drill
  const { resigned, aiEnded, config: sparGame } = spar
  useEffect(() => {
    if (!ready || mode === 'view') return
    if (placeholder.current) {
      placeholder.current = false
      return
    }
    try {
      const next: SavedSession = { ...(readSession() ?? {}), mode }
      if (mode === 'lesson') {
        if (course) next.lesson = { courseId: course.id, lessonMode, moves: game.moves.slice(0, cursor), score, attempts: attempts() }
        else delete next.lesson
      }
      if (mode === 'spar')
        next.spar = { start: game.start, moves: game.moves, cursor, userSide, tree, resigned: resigned || undefined, aiEnded: aiEnded ?? undefined, sparGame }
      if (mode === 'analyze') next.analyze = { start: game.start, moves: game.moves, cursor, userSide, tree }
      if (mode === 'tsume' && problem) next.tsume = { problemId: problem.problem.id, length: problem.length }
      if (mode === 'drill' && drillState) next.drill = { queue: drillState.queue }
      const text = JSON.stringify(next)
      try {
        localStorage.setItem(SESSION_KEY, text)
      } catch {
        freeAnalysisCache()
        localStorage.setItem(SESSION_KEY, text)
      }
    } catch (error) {
      console.warn('session not saved', error)
    }
  }, [ready, mode, course, lessonMode, game, cursor, userSide, score, showAnswer, attempts, tree, problem, drillState, resigned, aiEnded, sparGame])

  return ready
}
