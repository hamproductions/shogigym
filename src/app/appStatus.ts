import type { TFunction } from 'i18next'
import { cx } from '@/app/ui/cx'
import { LABELS } from '@/utils/analysis'
import { mistakeIsBad } from '@/utils/mistake'
import { moveText } from '@/utils/shogi'
import { isGameMode, type Mode, type Preview } from '@/app/types'
import type { GameResult } from '@/app/games'
import type { useBoardSession } from '@/app/hooks/useBoardSession'
import type { useLayout } from '@/app/hooks/useLayout'
import type { useMistake } from '@/app/hooks/useMistake'
import type { useMoveReview } from '@/app/hooks/useMoveReview'
import type { useAnalyzeGames } from '@/app/modes/analyze/useAnalyzeGames'
import type { useDrill } from '@/app/modes/drill/useDrill'
import type { useLesson } from '@/app/modes/lesson/useLesson'
import type { useSpar } from '@/app/modes/spar/useSpar'
import type { useTesuji } from '@/app/modes/tesuji/useTesuji'
import type { useTsume } from '@/app/modes/tsume/useTsume'
import type { useWatch } from '@/app/modes/view/useWatch'

export type Session = ReturnType<typeof useBoardSession>
export type Layout = ReturnType<typeof useLayout>
export type Mistakes = ReturnType<typeof useMistake>
export type Coach = ReturnType<typeof useMoveReview>
export type Lesson = ReturnType<typeof useLesson>
export type Drill = ReturnType<typeof useDrill>
export type Spar = ReturnType<typeof useSpar>
export type Watch = ReturnType<typeof useWatch>
export type Tsume = ReturnType<typeof useTsume>
export type Tesuji = ReturnType<typeof useTesuji>
export type Analyze = ReturnType<typeof useAnalyzeGames>

export interface ModeHandles {
  lesson: Lesson
  drill: Drill
  tesuji: Tesuji
  tsume: Tsume
  spar: Spar
  view: Watch
  analyze: Analyze
}

interface InstructionContext {
  t: TFunction
  mode: Mode
  handles: ModeHandles
  preview: Preview | null
  mistake: Mistakes['mistake']
  compact: boolean
  sfens: string[]
}

export function describeInstruction({ t, mode, handles, preview, mistake, compact, sfens }: InstructionContext): string {
  if (handles.lesson.checking) return t('app.checkingThatMove')
  if (preview && mistake) return t(mistakeIsBad(mistake) ? 'app.watchHowItGetsPunished' : 'app.watchWhatFollowsThenGo')
  if (mistake && !((mode === 'lesson' || mode === 'tesuji') && !compact && !preview)) {
    const move = moveText(sfens[mistake.base], mistake.usi)
    if (mistakeIsBad(mistake)) return t('app.wasAMistakeTryAgain', { move })
    return t(mode === 'lesson' || mode === 'drill' ? 'app.isAFineMoveBut' : 'app.isAFineMoveNotIt', { move })
  }
  if (preview) return t('app.previewWatchItPlayOut')
  return handles[mode].instruction()
}

export function modeTitle(mode: Mode, handles: ModeHandles) {
  if (mode === 'lesson') return handles.lesson.title
  if (mode === 'tsume') return handles.tsume.title ?? handles.analyze.title
  return handles[mode].title
}

interface PhoneTaskContext {
  t: TFunction
  mode: Mode
  layout: Layout
  session: Session
  spar: Spar
  coach: Coach
  drill: Drill
  instruction: string
  studyReply: { usi: string } | null
  picking: boolean
}

function phoneActionLabel({ t, mode, drill, studyReply, picking }: PhoneTaskContext) {
  if (studyReply) return t('app.playTheirMove')
  if (picking) return t('app.pickALesson')
  return mode === 'drill' && !drill.item ? t('app.pickAQueue') : t('app.panel')
}

export function phoneTaskFor(context: PhoneTaskContext) {
  const { t, mode, layout, session, spar, coach, instruction, studyReply } = context
  if (!layout.compact || layout.drawer || isGameMode(mode) || mode === 'view') return null
  if (spar.erred && coach.review) {
    return {
      text: t('app.phoneMistake', {
        move: moveText(session.sfens[coach.reviewAt - 1], session.game.moves[coach.reviewAt - 1]),
        label: LABELS[coach.review.label].text,
      }),
      action: t('app.takeBack'),
      run: spar.takeBack,
    }
  }
  return {
    text: instruction,
    action: phoneActionLabel(context),
    run: () => (studyReply ? session.play(studyReply.usi) : layout.setDrawer(true)),
  }
}

export function gameResult(mode: Mode, session: Session, spar: Spar): GameResult | null {
  const { userSide, toMove } = session
  const { resigned, flagged } = spar
  if (mode !== 'spar' || !(session.gameOver || resigned || flagged)) return null
  if (resigned) return 'resigned'
  if (flagged) return flagged === userSide ? 'time' : 'win'
  return toMove === userSide ? 'loss' : 'win'
}

type Course = Session['course']

/** The lesson or drill picker is showing, so the panel sheet opens by default. */
export function isPicking(mode: Mode, course: Course, drill: Drill) {
  return (mode === 'lesson' && !course) || (mode === 'drill' && !drill.item)
}

/** The layout should reserve room for a picker (an empty drill queue counts, an unselected card does not). */
export function layoutNeedsPicking(mode: Mode, course: Course, drill: Drill) {
  return (mode === 'lesson' && !course) || (mode === 'drill' && !drill.drill?.items.length)
}

/** Study mode with an open question offers its first good move as the keyboard hint. */
export function studyMoveUsi(lesson: Lesson) {
  return lesson.asking && lesson.lessonMode === 'study' ? lesson.good[0]?.usi : undefined
}

export const hidesAnswer = ({ lesson, drill, tsume, tesuji }: Pick<ModeHandles, 'lesson' | 'drill' | 'tsume' | 'tesuji'>) =>
  lesson.hidesAnswer || drill.hidesAnswer || tsume.hidesAnswer || tesuji.hidesAnswer

export function shellClassName(hideUi: boolean, layout: Layout) {
  return cx(
    'app-shell',
    hideUi && 'fs',
    layout.zoned ? 'zoned' : layout.panelHidden && 'panel-hidden',
    layout.compact && layout.drawer && 'drawer-open',
    layout.compact && layout.panelSide && 'panel-side',
    !!layout.sheetH && 'sheet-set',
  )
}

interface CommitContext {
  mode: Mode
  session: Session
  lesson: Lesson
  drill: Drill
  tsume: Tsume
  tesuji: Tesuji
}

/** Routes a move played on the board to the active mode, falling back to a plain move. */
export function commitMove({ mode, session, lesson, drill, tsume, tesuji }: CommitContext, usi: string) {
  if (mode === 'view') return
  session.setPromotion(null)
  session.setPeekFrom(null)
  if (mode === 'tesuji' && tesuji.drill) return tesuji.commit(usi)
  if (mode === 'tsume' && tsume.tsume) return tsume.commit(usi)
  if (lesson.commit(usi) || drill.commit(usi)) return
  session.play(usi)
}

/** Autoplay is offered in game modes and while a preview is running. */
export const canAutoplay = (session: Session) => isGameMode(session.mode) || !!session.preview
