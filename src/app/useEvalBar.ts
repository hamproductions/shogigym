import type { useEvaluation } from '@/app/hooks/useEvaluation'
import { useSteadyRate } from '@/app/hooks/useSteadyRate'
import { isGameMode, type LessonMode, type Mode } from '@/app/types'

interface EvalBarState {
  mode: Mode
  enabled: boolean
  inCourse: boolean
  lessonMode: LessonMode
  evaluation: ReturnType<typeof useEvaluation>
  hideUi: boolean
}

/** The evaluation bar rate (null when hidden) and whether the bar is shown. */
export function useEvalBar({ mode, enabled, inCourse, lessonMode, evaluation, hideUi }: EvalBarState) {
  const on = enabled && (isGameMode(mode) || mode === 'view' || (mode === 'lesson' && inCourse && lessonMode === 'study'))
  const steadyRate = useSteadyRate(on && evaluation.evalSente ? evaluation.senteRate : null)
  const evalRate = on ? (steadyRate ?? 0.5) : null
  return { evalRate, evalBar: evalRate !== null && !hideUi }
}
