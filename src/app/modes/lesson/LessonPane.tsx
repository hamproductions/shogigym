import './lesson.css'
import type { ReactNode } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { LABELS } from '@/utils/analysis'
import i18n from '@/utils/i18n'
import { SETUPS, type Course } from '@/utils/model'
import { moveText } from '@/utils/shogi'
import { useSession } from '@/app/hooks/session'
import { coursesOf, mainBranch, setupOf } from '@/utils/book'
import { mistakeHeadline, mistakeIsBad, type ShownMistake } from '@/utils/mistake'
import { sideMark } from '@/utils/notation'
import { moveGloss } from '@/app/pieceInfo'
import type { Level, Score } from '@/app/types'
import { Button } from '@/app/ui/Button'
import { Card } from '@/app/ui/Card'
import { OpeningPicker } from './OpeningPicker'
import type { Lesson } from './useLesson'

function quizSummary({ right, wrong, shown = 0, retried = 0 }: Score) {
  if (right === 0 && retried === 0 && (shown > 0 || wrong > 0)) return i18n.t('lesson.youNeededHelpForEvery')
  if (wrong === 0 && shown === 0 && retried === 0)
    return right === 1 ? i18n.t('lesson.yourMoveWasRightNo') : i18n.t('lesson.allMovesRightNoMistakes', { right })
  const parts = [
    i18n.t('lesson.firstTry', { count: right }),
    retried ? i18n.t('lesson.afterWrongTry', { count: retried }) : '',
    shown ? i18n.t('lesson.answersShown', { count: shown }) : '',
    wrong ? i18n.t('lesson.wrongTries', { count: wrong }) : '',
  ].filter(Boolean)
  return i18n.t('lesson.quizAgainUntilClean', { parts: parts.join(i18n.t('lesson.listSeparator')) })
}

function nextCourseAfter(course: Course) {
  const setup = setupOf(course)
  const siblings = coursesOf(setup?.courseIds ?? [])
  return siblings[siblings.findIndex((c) => c.id === course.id) + 1] ?? coursesOf(SETUPS.slice(SETUPS.indexOf(setup!) + 1).flatMap((s) => s.courseIds))[0]
}

interface LessonPaneProps {
  lesson: Lesson
  mistake: ShownMistake | null
  mistakePreview: boolean
  level: Level
  reply: { usi: string; note?: string } | null
  onPlayReply: (usi: string) => void
  lastNote?: string
  endRate: number | null
  onBack: () => void
}

const reveal = (el: HTMLElement | null) => el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })

type LessonMode = Lesson['lessonMode']

function lessonMoveNote(t: TFunction, mistake: ShownMistake, lessonMode: LessonMode, sfen: string) {
  if (lessonMode !== 'study') return ''
  const best = mistake.verdict?.best.move
  if (best && best !== mistake.expected && best !== mistake.usi) {
    return t('lesson.theLessonMoveIsThe', { move: moveText(sfen, mistake.expected), move2: moveText(sfen, best) })
  }
  return t('lesson.theLessonMoveIs', { move: moveText(sfen, mistake.expected) })
}

function MistakePreviewCard({
  mistake,
  sfen,
  lessonMode,
  playing,
  onBack,
}: {
  mistake: ShownMistake
  sfen: string
  lessonMode: LessonMode
  playing: boolean
  onBack: () => void
}) {
  const { t } = useTranslation()
  return (
    <Card tone={mistakeIsBad(mistake) ? 'bad' : 'good'}>
      <div className="app-verdict-head">
        {mistake.verdict && (
          <span className="app-badge" style={{ ['--label' as string]: LABELS[mistake.verdict.label].color }}>
            {LABELS[mistake.verdict.label].symbol}
          </span>
        )}
        <strong>{mistakeHeadline(moveText(sfen, mistake.usi), mistake)}</strong>
      </div>
      {mistake.note && <p>{mistake.note}</p>}
      {mistake.verdict && mistake.verdict.reasons.length > 0 && (
        <ul className="app-why">
          {mistake.verdict.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
      {mistake.verdict && !mistake.note && mistake.verdict.reasons.length === 0 && (
        <p>{mistakeIsBad(mistake) ? t('lesson.theOpponentGetsTheBetter') : t('lesson.nothingGoesWrongRightAway')}</p>
      )}
      <p className="app-muted">
        {lessonMoveNote(t, mistake, lessonMode, sfen)}
        {playing ? t('lesson.theBoardIsPlayingOut') : t('lesson.thatIsHowItContinues')}
      </p>
      <Button variant="primary" onClick={onBack}>
        {t('lesson.goBackAndTryAgain')}
      </Button>
    </Card>
  )
}

function OffBookCard({ lesson }: { lesson: Lesson }) {
  const { t } = useTranslation()
  return (
    <Card>
      <strong>{t('lesson.youLeftTheLessonLine')}</strong>
      <p>{t('lesson.theBookHasNoMoves')}</p>
      <div className="app-actions">
        <Button variant="primary" onClick={lesson.backToLine}>
          {t('lesson.backToTheLessonLine')}
        </Button>
        <Button onClick={lesson.explore}>{t('lesson.exploreItInAnalyze')}</Button>
      </div>
    </Card>
  )
}

function WhatIfCard({ whatIf }: { whatIf: string }) {
  const { t } = useTranslation()
  return (
    <Card>
      <strong>{t('lesson.preview', { whatIf })}</strong>
      <p>{t('lesson.theAiPlaysTheBest')}</p>
    </Card>
  )
}

function EndRateNote({ endRate }: { endRate: number }) {
  const { t } = useTranslation()
  const value = Math.round(endRate * 100)
  if (endRate >= 0.55) return <p className="app-end good">{t('lesson.aiSViewOfThe', { value })}</p>
  if (endRate <= 0.45) return <p className="app-end bad">{t('lesson.aiSViewOfThe2', { value })}</p>
  return <p className="app-end">{t('lesson.aiSViewOfThe3', { value })}</p>
}

function doneSummary(t: TFunction, lessonMode: LessonMode, score: Score, jumped: boolean) {
  if (lessonMode === 'quiz') return quizSummary(score)
  return jumped ? t('lesson.endOfThisBranchYou') : t('lesson.youHaveSeenTheWhole')
}

function DoneCard({ lesson, course, endRate, endComment }: { lesson: Lesson; course: Course; endRate: number | null; endComment: string | undefined }) {
  const { t } = useTranslation()
  const { lessonMode, score, jumped } = lesson
  const nextCourse = nextCourseAfter(course)
  return (
    <Card tone="good">
      <strong>{t('lesson.lineComplete')}</strong>
      <div className="app-actions">
        {lessonMode === 'study' && (
          <Button variant="primary" onClick={() => lesson.open(course, 'quiz')}>
            {t('lesson.quizThisLine')}
          </Button>
        )}
        {nextCourse && (
          <Button variant={lessonMode === 'quiz' ? 'primary' : 'secondary'} onClick={() => lesson.open(nextCourse, lessonMode)}>
            {t('lesson.nextLesson')}
          </Button>
        )}
        <Button onClick={() => lesson.open(course, lessonMode)}>{t('lesson.startAgain')}</Button>
        <Button onClick={lesson.leave}>{t('lesson.otherLessons')}</Button>
      </div>
      {endComment && <p className="app-endnote">{endComment}</p>}
      <p>{doneSummary(t, lessonMode, score, jumped)}</p>
      {endRate !== null && <EndRateNote endRate={endRate} />}
    </Card>
  )
}

function AskingCard({
  lesson,
  mistake,
  mistakePreview,
  sfen,
  level,
}: {
  lesson: Lesson
  mistake: ShownMistake | null
  mistakePreview: boolean
  sfen: string
  level: Level
}) {
  const { t } = useTranslation()
  const { userSide } = useSession()
  const { lessonMode, showAnswer, good } = lesson
  const side = sideMark(userSide)
  return (
    <Card>
      {mistake && !mistakePreview && (
        <p key={`${mistake.base}:${mistake.usi}`} ref={reveal} className="app-result wrong">
          {mistakeIsBad(mistake)
            ? t('lesson.wasLabel', { move: moveText(sfen, mistake.usi), label: (mistake.verdict ? LABELS[mistake.verdict.label] : LABELS.mistake).text })
            : t('lesson.isNotThisLessonS', { move: moveText(sfen, mistake.usi) })}
        </p>
      )}
      {lessonMode === 'study' || showAnswer ? (
        <>
          <strong>{t('lesson.yourMoveAs', { side })}</strong>
          {good.map((g) => (
            <div key={g.usi} className="app-answer">
              <span className="app-answer-move">{moveText(sfen, g.usi)}</span>
              {level === 'new' && <span className="app-gloss">{moveGloss(sfen, g.usi)}</span>}
              {g.note && <p>{g.note}</p>}
            </div>
          ))}
          <p className="app-muted">{t('lesson.playItOnTheBoard')}</p>
        </>
      ) : (
        <>
          <strong>{t('lesson.yourMoveAsFindThe', { side })}</strong>
          <Button size="sm" variant="ghost" className="app-answer-reveal" onClick={lesson.revealAnswer}>
            {t('lesson.showMeTheAnswer')}
          </Button>
        </>
      )}
    </Card>
  )
}

interface TheirMoveCardProps {
  theirs: { usi: string; note?: string } | undefined
  sfen: string
  level: Level
  lessonMode: LessonMode
  atEnd: boolean
  onPlayReply: (usi: string) => void
}

function TheirMoveCard({ theirs, sfen, level, lessonMode, atEnd, onPlayReply }: TheirMoveCardProps) {
  const { t } = useTranslation()
  return (
    <Card>
      <strong>{theirs ? t('lesson.theirMove', { move: moveText(sfen, theirs.usi) }) : t('lesson.theirMove2')}</strong>
      {level === 'new' && theirs && <span className="app-gloss">{moveGloss(sfen, theirs.usi)}</span>}
      {theirs?.note && <p>{theirs.note}</p>}
      {theirs && (lessonMode === 'study' || !atEnd) ? (
        <Button variant="primary" onClick={() => onPlayReply(theirs.usi)}>
          {t('lesson.playTheirMove')} <span className="app-key">Space</span>
        </Button>
      ) : (
        <p className="app-muted">{theirs ? t('lesson.comingInAMoment') : t('lesson.noBookReply')}</p>
      )}
    </Card>
  )
}

function LessonStatus({ lesson, mistake }: { lesson: Lesson; mistake: ShownMistake | null }) {
  const { t } = useTranslation()
  const { lessonMode, score, justRight, checking, progress, done } = lesson
  return (
    <>
      {progress && progress.total > 0 && (
        <span className="app-progress-count">{t('lesson.yourMoves', { value: Math.min(progress.done, progress.total), total: progress.total })}</span>
      )}
      {lessonMode === 'quiz' && (score.right > 0 || score.wrong > 0 || justRight) && (
        <p className="app-score">
          <span className="right">✓ {score.right}</span>
          <span className="wrong">✗ {score.wrong}</span>
          {justRight && !mistake && !done && <span className="app-just-right">{t('lesson.rightThatIsTheLesson')}</span>}
        </p>
      )}
      {checking && <p className="app-muted">{t('lesson.checkingThatMove')}</p>}
    </>
  )
}

function LessonFooter({ course, lesson, lastNote, mistakePreview }: { course: Course; lesson: Lesson; lastNote: string | undefined; mistakePreview: boolean }) {
  const { t } = useTranslation()
  const { lastMove, prevSfen } = useSession()
  return (
    <>
      {lastMove && prevSfen && lastNote && !mistakePreview && (
        <div className="app-last">
          <span className="app-muted">{t('lesson.lastMove', { move: moveText(prevSfen, lastMove) })}</span>
          <p>{lastNote}</p>
        </div>
      )}
      {!lastMove && course.root.comment && <p className="app-last">{course.root.comment}</p>}
      <button className="app-explore" onClick={lesson.explore}>
        {t('lesson.tryYourOwnMovesFrom')}
        <span>{t('lesson.opensThisPositionInAnalyze')}</span>
      </button>
      {course.source && (
        <details className="app-source">
          <summary>{t('lesson.source')}</summary>
          <p>{course.source}</p>
        </details>
      )}
    </>
  )
}

export function LessonPane({ lesson, mistake, mistakePreview, level, reply, onPlayReply, lastNote, endRate, onBack }: LessonPaneProps) {
  const { course, liveSfen: sfen, playing, preview, atEnd } = useSession()
  const { lessonMode, done, asking, offBook } = lesson
  if (!course) return <OpeningPicker onOpen={lesson.open} level={level} setupId={lesson.pickerSetup} setSetupId={lesson.setPickerSetup} />
  const whatIf = preview && !mistake ? preview.title : null
  const theirs = reply ?? mainBranch(lesson.node)
  const endComment = done ? lesson.node?.comment : undefined
  let card: ReactNode
  if (mistakePreview && mistake) card = <MistakePreviewCard mistake={mistake} sfen={sfen} lessonMode={lessonMode} playing={playing} onBack={onBack} />
  else if (offBook) card = <OffBookCard lesson={lesson} />
  else if (whatIf) card = <WhatIfCard whatIf={whatIf} />
  else if (done) card = <DoneCard lesson={lesson} course={course} endRate={endRate} endComment={endComment} />
  else if (asking) card = <AskingCard lesson={lesson} mistake={mistake} mistakePreview={mistakePreview} sfen={sfen} level={level} />
  else card = <TheirMoveCard theirs={theirs} sfen={sfen} level={level} lessonMode={lessonMode} atEnd={atEnd} onPlayReply={onPlayReply} />
  return (
    <div className="app-lesson-pane">
      <LessonStatus lesson={lesson} mistake={mistake} />
      {card}
      <LessonFooter course={course} lesson={lesson} lastNote={lastNote} mistakePreview={mistakePreview} />
    </div>
  )
}
