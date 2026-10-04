import './lesson.css'
import { useTranslation } from 'react-i18next'
import { LABELS } from '../../../analysis'
import i18n from '../../../i18n'
import { SETUPS, type Course } from '../../../model'
import { moveText } from '../../../shogi'
import { useSession } from '../../hooks/session'
import { coursesOf, mainBranch, setupOf } from '../../lib/book'
import { mistakeHeadline, mistakeIsBad, type ShownMistake } from '../../lib/mistake'
import { sideMark } from '../../lib/notation'
import { moveGloss } from '../../pieces'
import type { Level, Score } from '../../types'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { OpeningPicker } from './OpeningPicker'
import type { Lesson } from './useLesson'

function quizSummary({ right, wrong, shown = 0, retried = 0 }: Score) {
  if (right === 0 && retried === 0 && (shown > 0 || wrong > 0)) return i18n.t('lesson.youNeededHelpForEvery')
  if (wrong === 0 && shown === 0 && retried === 0) return right === 1 ? i18n.t('lesson.yourMoveWasRightNo') : i18n.t('lesson.allMovesRightNoMistakes', { right })
  const parts = [i18n.t('lesson.firstTry', { count: right }), retried ? i18n.t('lesson.afterWrongTry', { count: retried }) : '', shown ? i18n.t('lesson.answersShown', { count: shown }) : '', wrong ? i18n.t('lesson.wrongTries', { count: wrong }) : ''].filter(Boolean)
  return i18n.t('lesson.quizAgainUntilClean', { parts: parts.join(i18n.t('lesson.listSeparator')) })
}

function nextCourseAfter(course: Course) {
  const setup = setupOf(course)
  const siblings = coursesOf(setup?.courseIds ?? [])
  return siblings[siblings.findIndex((c) => c.id === course.id) + 1] ?? coursesOf(SETUPS.slice(SETUPS.indexOf(setup!) + 1).flatMap((s) => s.courseIds))[0]
}

type LessonPaneProps = {
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

export function LessonPane({ lesson, mistake, mistakePreview, level, reply, onPlayReply, lastNote, endRate, onBack }: LessonPaneProps) {
  const { t } = useTranslation()
  const { course, liveSfen: sfen, userSide, lastMove, prevSfen, playing, preview, atEnd } = useSession()
  const { lessonMode, score, justRight, checking, progress, done, asking, offBook, good, showAnswer, jumped } = lesson
  if (!course) return <OpeningPicker onOpen={lesson.open} level={level} setupId={lesson.pickerSetup} setSetupId={lesson.setPickerSetup} />
  const side = sideMark(userSide)
  const nextCourse = nextCourseAfter(course)
  const whatIf = preview && !mistake ? preview.title : null
  const theirs = reply ?? mainBranch(lesson.node)
  const endComment = done ? lesson.node?.comment : undefined
  return (
    <div className="app-lesson-pane">
      {progress && progress.total > 0 && (
        <span className="app-progress-count">
          {t('lesson.yourMoves', { value: Math.min(progress.done, progress.total), total: progress.total })}
        </span>
      )}
      {lessonMode === 'quiz' && (score.right > 0 || score.wrong > 0 || justRight) && (
        <p className="app-score">
          <span className="right">✓ {score.right}</span>
          <span className="wrong">✗ {score.wrong}</span>
          {justRight && !mistake && !done && <span className="app-just-right">{t('lesson.rightThatIsTheLesson')}</span>}
        </p>
      )}
      {checking && <p className="app-muted">{t('lesson.checkingThatMove')}</p>}
      {mistakePreview && mistake ? (
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
          {mistake.verdict && !mistake.note && mistake.verdict.reasons.length === 0 && <p>{mistakeIsBad(mistake) ? t('lesson.theOpponentGetsTheBetter') : t('lesson.nothingGoesWrongRightAway')}</p>}
          <p className="app-muted">
            {lessonMode === 'study' ? (mistake.verdict && mistake.verdict.best.move !== mistake.expected && mistake.verdict.best.move !== mistake.usi ? t('lesson.theLessonMoveIsThe', { move: moveText(sfen, mistake.expected), move2: moveText(sfen, mistake.verdict.best.move) }) : t('lesson.theLessonMoveIs', { move: moveText(sfen, mistake.expected) })) : ''}
            {playing ? t('lesson.theBoardIsPlayingOut') : t('lesson.thatIsHowItContinues')}
          </p>
          <Button variant="primary" onClick={onBack}>
            {t('lesson.goBackAndTryAgain')}
          </Button>
        </Card>
      ) : offBook ? (
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
      ) : whatIf ? (
        <Card>
          <strong>{t('lesson.preview', { whatIf })}</strong>
          <p>{t('lesson.theAiPlaysTheBest')}</p>
        </Card>
      ) : done ? (
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
          <p>{lessonMode === 'quiz' ? quizSummary(score) : jumped ? t('lesson.endOfThisBranchYou') : t('lesson.youHaveSeenTheWhole')}</p>
          {endRate !== null && (
            <p className={endRate >= 0.55 ? 'app-end good' : endRate <= 0.45 ? 'app-end bad' : 'app-end'}>
              {endRate >= 0.55
                ? t('lesson.aiSViewOfThe', { value: Math.round(endRate * 100) })
                : endRate <= 0.45
                  ? t('lesson.aiSViewOfThe2', { value: Math.round(endRate * 100) })
                  : t('lesson.aiSViewOfThe3', { value: Math.round(endRate * 100) })}
            </p>
          )}
        </Card>
      ) : asking ? (
        <Card>
          {mistake && !mistakePreview && <p key={`${mistake.base}:${mistake.usi}`} ref={reveal} className="app-result wrong">{mistakeIsBad(mistake) ? t('lesson.wasLabel', { move: moveText(sfen, mistake.usi), label: (mistake.verdict ? LABELS[mistake.verdict.label] : LABELS.mistake).text }) : t('lesson.isNotThisLessonS', { move: moveText(sfen, mistake.usi) })}</p>}
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
      ) : (
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
      )}
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
    </div>
  )
}
