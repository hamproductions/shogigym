import { loadActivity, streakOf } from '@/utils/activity'
import { cachedReview } from '@/app/memory'
import { loadGames } from '@/app/games'
import { courseProgress, coursesForMain, loadTsumeStats, openedCourses, PROBLEMS, reviewCounts } from '@/app/practice'
import { tesujiStats } from '@/app/tesujiDrills'
import { getSettings } from '@/appearance/settings'
import { allCards, isLearned } from '@/utils/srs'
import { loadMistakes } from '@/utils/mistakes'
import { buildProfile, type Profile, type Snapshot } from '@/utils/learning'
import { courseById, courseTitle } from '@/utils/model'
import i18n from '@/utils/i18n'

const MATE_BY_ID = new Map(PROBLEMS.map((p) => [p.id, p.mate]))

function lessonToContinue(): Snapshot['lessonToContinue'] {
  const opened = openedCourses()
  const pool = coursesForMain(getSettings().mainStrategy)
  const candidates = [...opened.flatMap((id) => courseById(id) ?? []), ...pool]
  for (const course of candidates) {
    const { total, learned } = courseProgress(course)
    if (total > 0 && learned < total) return { id: course.id, title: courseTitle(course, i18n.language), learned, total }
  }
  return undefined
}

export function learningSnapshot(): { snapshot: Snapshot; profile: Profile } {
  const counts = reviewCounts()
  const mistakes = loadMistakes()
  const games = loadGames()
  const tsume = loadTsumeStats()
  const byLength: Record<number, number> = {}
  for (const id of tsume.solved) {
    const mate = MATE_BY_ID.get(id)
    if (mate) byLength[mate] = (byLength[mate] ?? 0) + 1
  }
  const streak = streakOf(loadActivity())
  const profile = buildProfile(games, mistakes, cachedReview)
  const snapshot: Snapshot = {
    due: counts.due,
    mistakesDue: counts.mistakes,
    difficult: counts.difficult,
    newPositions: counts.new,
    learned: allCards().filter((c) => c.key.startsWith('pos#') && isLearned(c)).length,
    started: counts.started,
    tsumeSolved: tsume.solved.length,
    tsumeByLength: byLength,
    tesujiSolved: tesujiStats().solved.length,
    openedLessons: openedCourses().length,
    lessonToContinue: lessonToContinue(),
    gamesPlayed: games.filter((g) => g.vsAi).length,
    mistakesSaved: mistakes.length,
    streak: streak.days,
    practisedToday: streak.today,
  }
  return { snapshot, profile }
}
