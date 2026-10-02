import { useEffect, useRef } from 'react'
import { Position } from 'tsshogi'
import { COURSES } from '../../model'
import { applyUsi, type Side } from '../../shogi'
import { setupOf } from '../lib/book'
import type { Drill } from '../modes/drill/useDrill'
import type { Lesson } from '../modes/lesson/useLesson'
import type { Tsume, TsumeLength } from '../modes/tsume/useTsume'
import { PROBLEMS, type ReviewQueue } from '../practice'
import type { Tree } from '../tree'
import type { LessonMode, Mode, Score } from '../types'
import type { BoardSession } from './useBoardSession'
import type { ModeSlots, Snapshot } from './useModeSwitch'

const SESSION_KEY = 'joseki-practice:session:v2'

type SavedGame = { start: string; moves: string[]; cursor: number; userSide: Side; tree?: Tree }
type SavedSession = { mode: Mode; lesson?: { courseId: string; lessonMode: LessonMode; moves: string[]; score?: Score }; spar?: SavedGame; analyze?: SavedGame; tsume?: { problemId: string; length: TsumeLength }; drill?: { queue: ReviewQueue } }

const readSession = () => JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as SavedSession | null

function replays(start: string, moves: string[]) {
  let at: string | null = Position.newBySFEN(start) ? start : null
  for (const usi of moves) at = at && applyUsi(at, usi)
  return !!at
}

type Persisted = { session: BoardSession; lesson: Lesson; tsume: Tsume; drill: Drill; slots: ModeSlots; resume: (mode: Mode, snapshot: Snapshot) => void }

export function usePersistedSession({ session, lesson, tsume, drill, slots, resume }: Persisted) {
  const { mode, course, game, cursor, userSide, tree } = session
  const restored = useRef(false)

  useEffect(() => {
    if (restored.current) return
    restored.current = true
    try {
      const data = readSession()
      if (!data) return
      for (const m of ['spar', 'analyze'] as const) {
        const g = data[m]
        if (g && replays(g.start, g.moves)) slots.stash(m, { game: { start: g.start, moves: g.moves }, cursor: g.cursor, userSide: g.userSide, flipped: g.userSide === 'gote', course: null, lessonMode: 'study', score: { right: 0, wrong: 0 }, tree: g.tree })
      }
      const saw = data.lesson
      const c = saw && COURSES.find((x) => x.id === saw.courseId)
      if (c && saw && replays(c.root.sfen, saw.moves)) slots.stash('lesson', { game: { start: c.root.sfen, moves: saw.moves }, cursor: saw.moves.length, userSide: c.userSide, flipped: c.userSide === 'gote', course: c, lessonMode: saw.lessonMode, score: saw.score ?? { right: 0, wrong: 0 } })
      const back = slots.stashed(data.mode)
      if (back && (data.mode === 'spar' || data.mode === 'analyze' || data.mode === 'lesson')) {
        resume(data.mode, back)
        if (back.course) lesson.setPickerSetup(setupOf(back.course)?.id ?? null)
      }
      const problem = data.mode === 'tsume' && data.tsume ? PROBLEMS.find((p) => p.id === data.tsume!.problemId) : undefined
      if (problem) tsume.restore(problem, data.tsume!.length)
      if (data.mode === 'drill' && data.drill) drill.start(data.drill.queue)
    } catch (error) {
      console.warn('session not restored', error)
    }
  })

  const { lessonMode, score } = lesson
  const problem = tsume.tsume
  const drillState = drill.drill
  useEffect(() => {
    if (!restored.current) return
    try {
      const prev = readSession() ?? { mode: 'spar' }
      const next: SavedSession = { ...prev, mode }
      if (mode === 'lesson') next.lesson = course ? { courseId: course.id, lessonMode, moves: game.moves.slice(0, cursor), score } : undefined
      if (mode === 'spar') next.spar = { start: game.start, moves: game.moves, cursor, userSide, tree }
      if (mode === 'analyze') next.analyze = { start: game.start, moves: game.moves, cursor, userSide, tree }
      if (mode === 'tsume' && problem) next.tsume = { problemId: problem.problem.id, length: problem.length }
      if (mode === 'drill') next.drill = drillState ? { queue: drillState.queue } : undefined
      localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    } catch (error) {
      console.warn('session not saved', error)
    }
  }, [mode, course, lessonMode, game, cursor, userSide, score, tree, problem, drillState])
}
