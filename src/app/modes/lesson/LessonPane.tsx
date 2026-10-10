import './lesson.css'
import './source-reader.css'
import { useTranslation } from 'react-i18next'
import { LABELS } from '@/utils/analysis'
import i18n from '@/utils/i18n'
import { SETUPS, type Course } from '@/utils/model'
import { moveText } from '@/utils/shogi'
import { useSession } from '@/app/hooks/session'
import { coursesOf, lessonText, mainBranch, setupOf } from '@/utils/book'
import { mistakeHeadline, mistakeIsBad, type ShownMistake } from '@/utils/mistake'
import { sideMark } from '@/utils/notation'
import { moveGloss } from '@/app/pieces'
import type { Level, Score } from '@/app/types'
import { Button } from '@/app/ui/Button'
import { Card } from '@/app/ui/Card'
import { courseProgress } from '@/app/practice'
import type { LessonMode } from '@/app/types'
import { RANDOM_KEY, store, stored } from './reading'
import { OpeningPicker } from './OpeningPicker'
import { LessonGuide } from './LessonGuide'
import type { Lesson } from './useLesson'

const TALLY_KEY = 'joseki-practice:random-quiz:v1'
type Tally = { questions: number; right: number; wrong: number }

function readTally(): Tally {
  try {
    return { questions: 0, right: 0, wrong: 0, ...JSON.parse(sessionStorage.getItem(TALLY_KEY) ?? '{}') }
  } catch {
    return { questions: 0, right: 0, wrong: 0 }
  }
}

function writeTally(tally: Tally | null) {
  try {
    if (tally) sessionStorage.setItem(TALLY_KEY, JSON.stringify(tally))
    else sessionStorage.removeItem(TALLY_KEY)
  } catch {
    void 0
  }
}

function seriesOf(course: Course, lesson: Lesson) {
  const setup = setupOf(course)
  if (!setup) return null
  const siblings = coursesOf(setup.courseIds)
  const at = siblings.findIndex((c) => c.baseId === course.baseId)
  const random = stored(RANDOM_KEY) === setup.id
  const quizzable = siblings.filter((c) => courseProgress(c).total > 0)
  const peers = setup.path ? SETUPS.filter((s) => s.path?.join('/') === setup.path?.join('/')) : []
  const nextSetup = peers[peers.indexOf(setup) + 1]
  const go = (next: Course | undefined, mode: LessonMode, shuffled = random) => {
    if (!next) return
    if (shuffled && random) {
      const tally = readTally()
      writeTally({ questions: tally.questions + 1, right: tally.right + lesson.score.right, wrong: tally.wrong + lesson.score.wrong })
    } else writeTally(null)
    store(RANDOM_KEY, shuffled ? setup.id : null)
    lesson.open(next, mode)
  }
  const pick = () => {
    const others = quizzable.filter((c) => c.baseId !== course.baseId)
    return others[Math.floor(Math.random() * others.length)] ?? quizzable[0]
  }
  const leaveTo = (id: string) => {
    store(RANDOM_KEY, null)
    writeTally(null)
    lesson.leave()
    lesson.setPickerSetup(id)
  }
  return {
    at,
    total: siblings.length,
    random,
    tally: random ? readTally() : null,
    prev: !random && at > 0 ? (mode: LessonMode) => go(siblings[at - 1], mode) : null,
    next: random ? (mode: LessonMode) => go(pick(), mode) : at < siblings.length - 1 ? (mode: LessonMode) => go(siblings[at + 1], mode) : null,
    shuffle: quizzable.length > 1 ? () => go(pick(), 'quiz', true) : null,
    back: () => leaveTo(setup.id),
    nextTopic: nextSetup && (() => leaveTo(nextSetup.id)),
  }
}

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
  if (!setup) return null
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

export function LessonPane({ lesson, mistake, mistakePreview, level, reply, onPlayReply, lastNote, endRate, onBack }: LessonPaneProps) {
  const { t } = useTranslation()
  const { course, liveSfen: sfen, userSide, lastMove, prevSfen, playing, preview, atEnd } = useSession()
  const { lessonMode, score, justRight, checking, progress, done, asking, offBook, good, showAnswer, jumped } = lesson
  if (!course) return <OpeningPicker onOpen={lesson.open} level={level} setupId={lesson.pickerSetup} setSetupId={lesson.setPickerSetup} />
  const side = sideMark(userSide)
  const series = seriesOf(course, lesson)
  const nextCourse = series ? null : nextCourseAfter(course)
  const whatIf = preview && !mistake ? preview.title : null
  const theirs = reply ?? mainBranch(lesson.node)
  const endComment = done ? lesson.node?.comment : undefined
  if (setupOf(course)?.path && lessonMode === 'study' && !(mistakePreview && mistake) && !offBook && !whatIf)
    return (
      <div className="app-lesson-pane study">
        <LessonGuide course={course} lesson={lesson} series={series} />
      </div>
    )
  return (
    <div className={`app-lesson-pane ${lessonMode}`}>
      {series && (
        <nav className="app-series" aria-label={t('lesson.series')}>
          <button className="app-back" onClick={series.back}>
            ‹ {t('lesson.backToArticle')}
          </button>
          <Button size="sm" disabled={!series.prev} onClick={() => series.prev?.(lessonMode)} aria-label={t('lesson.previousSequence')}>
            ‹
          </Button>
          <span>
            {series.tally
              ? t('lesson.randomTally', { count: series.tally.questions + 1, right: series.tally.right, wrong: series.tally.wrong })
              : t('lesson.sequenceOf', { value: series.at + 1, total: series.total })}
          </span>
          <Button size="sm" disabled={!series.next} onClick={() => series.next?.(lessonMode)} aria-label={t('lesson.nextSequence')}>
            ›
          </Button>
          {series.shuffle && !series.random && (
            <Button size="sm" variant="ghost" onClick={series.shuffle}>
              {t('lesson.randomQuiz')}
            </Button>
          )}
        </nav>
      )}
      {progress && progress.total > 0 && (
        <span className="app-progress-count">{t('lesson.yourMoves', { value: Math.min(progress.done, progress.total), total: progress.total })}</span>
      )}
      {lessonMode === 'quiz' && (
        <p className="app-score">
          <span className="right">✓ {score.right}</span>
          <span className="wrong">✗ {score.wrong}</span>
          {justRight && !mistake && !done && <span className="app-just-right">{t('lesson.rightThatIsTheLesson')}</span>}
        </p>
      )}
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
          {mistake.verdict && !mistake.note && mistake.verdict.reasons.length === 0 && (
            <p>{mistakeIsBad(mistake) ? t('lesson.theOpponentGetsTheBetter') : t('lesson.nothingGoesWrongRightAway')}</p>
          )}
          <p className="app-muted">
            {lessonMode === 'study'
              ? mistake.verdict && mistake.verdict.best.move !== mistake.expected && mistake.verdict.best.move !== mistake.usi
                ? t('lesson.theLessonMoveIsThe', { move: moveText(sfen, mistake.expected), move2: moveText(sfen, mistake.verdict.best.move) })
                : t('lesson.theLessonMoveIs', { move: moveText(sfen, mistake.expected) })
              : ''}
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
            {series?.next && (
              <Button variant={lessonMode === 'quiz' ? 'primary' : 'secondary'} onClick={() => series.next!(series.random ? 'quiz' : lessonMode)}>
                {series.random ? t('lesson.nextQuestion') : t('lesson.nextSequence')}
              </Button>
            )}
            {nextCourse && (
              <Button variant={lessonMode === 'quiz' ? 'primary' : 'secondary'} onClick={() => lesson.open(nextCourse, lessonMode)}>
                {t('lesson.nextLesson')}
              </Button>
            )}
            <Button onClick={() => lesson.open(course, lessonMode)}>{t('lesson.startAgain')}</Button>
            {series && !series.next && !series.random && series.nextTopic && (
              <Button variant={lessonMode === 'quiz' ? 'primary' : 'secondary'} onClick={series.nextTopic}>
                {t('lesson.nextArticle')}
              </Button>
            )}
            <Button onClick={series ? series.back : lesson.leave}>{series ? t('lesson.backToArticle') : t('lesson.otherLessons')}</Button>
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
              <strong>{lesson.quizTask ?? t('lesson.yourMoveAsFindThe', { side })}</strong>
              <Button size="sm" variant="ghost" className="app-answer-reveal" onClick={lesson.revealAnswer}>
                {t('lesson.showMeTheAnswer')}
              </Button>
            </>
          )}
          <div className={`app-lesson-feedback${lessonMode === 'study' ? ' floating' : ''}`} role="status">
            {checking ? (
              <p className="app-muted">{t('lesson.checkingThatMove')}</p>
            ) : mistake && !mistakePreview ? (
              <p className="app-result wrong">
                {mistakeIsBad(mistake)
                  ? t('lesson.wasLabel', { move: moveText(sfen, mistake.usi), label: (mistake.verdict ? LABELS[mistake.verdict.label] : LABELS.mistake).text })
                  : t('lesson.isNotThisLessonS', { move: moveText(sfen, mistake.usi) })}
              </p>
            ) : null}
          </div>
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
      {!lastMove && course.root.comment && <p className="app-last">{lessonText(course.root.comment, course.root.commentEn, i18n.language, course)}</p>}
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
