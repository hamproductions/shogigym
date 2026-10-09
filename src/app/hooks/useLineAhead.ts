import { mainBranch } from '@/utils/book'
import type { Lesson } from '@/app/modes/lesson/useLesson'
import type { BoardSession } from './useBoardSession'

export function useLineAhead(session: BoardSession, lesson: Lesson) {
  const { mode, game, preview, course, atEnd, cursor, setGame, setCursor } = session
  if (!(mode === 'lesson' && course && lesson.lessonMode === 'study' && atEnd && !preview)) return null
  const ahead: string[] = []
  let branch = mainBranch(lesson.node)
  while (branch) {
    ahead.push(branch.usi)
    branch = branch.child ? mainBranch(branch.child) : undefined
  }
  if (!ahead.length) return null
  const step = (count: number) => {
    const moves = [...game.moves.slice(0, cursor), ...ahead.slice(0, count)]
    setGame({ ...game, moves })
    setCursor(moves.length)
  }
  return { forward: () => step(1), last: () => step(ahead.length) }
}
