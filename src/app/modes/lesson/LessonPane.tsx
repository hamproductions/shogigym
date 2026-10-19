import { SquareText } from '@/app/modes/lesson/SquareText'
import { useTranslation } from 'react-i18next'
import { LABELS } from '@/utils/analysis'
import i18n from '@/utils/i18n'
import { SETUPS, type Course } from '@/utils/model'
import { moveText } from '@/utils/shogi'
import { useSession } from '@/app/hooks/session'
import { FlipMarks } from '@/app/ui/SideMark'
import { coursesOf, lessonText, mainBranch, setupOf } from '@/utils/book'
import { mistakeHeadline, mistakeIsBad, type ShownMistake } from '@/utils/mistake'
import { sideMark } from '@/utils/notation'
import { moveGloss } from '@/app/pieces'
import type { Level, Score } from '@/app/types'
import { Button } from '@/app/ui/Button'
import { Card } from '@/app/ui/Card'
import { css } from 'styled-system/css'
import { cx } from '@/app/ui/cx'
import { Kbd } from '@/components/ui'
import { Wrap } from 'styled-system/jsx'
import { backLink, badge, muted, narrowColumn, note, result, verdictHead } from '@/app/panels/panels.styles'
import { feedback, lessonPane, progressCount, series as seriesNav, seriesBack, seriesCount, sourceNote, studyPane } from './lesson.styles'

const scoreRow = css({
  display: 'flex',
  gap: '3',
  m: '{spacing.2.5} 0 0',
  fontWeight: 'bold',
  h: 'calc(1em * {lineHeights.normal})',
  overflowX: 'auto',
  whiteSpace: 'nowrap',
  flexShrink: '0',
  '& > span': { flexShrink: '0' },
  '& .right': { color: 'success' },
  '& .wrong': { color: 'danger' },
  _narrow: { order: '-2', m: '0 0 {spacing.2.5}' },
})

const answer = css({ mt: '1.5', '.app-card &': { '& p': { m: '{spacing.0.5} 0 0', fontFamily: 'mincho' } } })

const answerMove = css({ color: 'success', fontFamily: 'mincho', fontWeight: 'heavy', fontSize: 'xl' })

const gloss = css({ display: 'block', color: 'fg.muted', fontSize: 'xs' })

const last = css({ m: '{spacing.3} 0 0', fontFamily: 'mincho', fontSize: 'sm', lineHeight: 'mincho', '& p': { m: '{spacing.0.5} 0 0' } })

const explore = css({
  display: 'block',
  w: '100%',
  mt: '3',
  p: '{spacing.2.5} {spacing.3}',
  border: '1px dashed {colors.border.strong}',
  borderRadius: 'lg',
  textAlign: 'left',
  fontWeight: 'bold',
  fontSize: 'sm',
  transition: 'background {durations.fast}',
  _hover: { bg: 'surface.2' },
  '& span': { display: 'block', fontWeight: 'regular', fontSize: 'xs', color: 'fg.muted' },
})
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

const endVerdict = css({ fontWeight: 'bold', '&[data-outcome=ahead]': { color: 'success' }, '&[data-outcome=behind]': { color: 'danger' } })

export function LessonPane({ lesson, mistake, mistakePreview, level, reply, onPlayReply, lastNote, endRate, onBack }: LessonPaneProps) {
  const { t } = useTranslation()
  const { course, liveSfen: sfen, userSide, lastMove, prevSfen, playing, preview, atEnd, flipped } = useSession()
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
      <div className={cx(lessonPane, studyPane, narrowColumn)}>
        <LessonGuide course={course} lesson={lesson} series={series} />
      </div>
    )
  return (
    <div className={cx(lessonPane, lessonMode === 'study' && studyPane, narrowColumn)}>
      {series && (
        <nav className={seriesNav} aria-label={t('lesson.series')}>
          <button className={cx(backLink, seriesBack)} onClick={series.back}>
            ‹ {t('lesson.backToArticle')}
          </button>
          <Button size="sm" disabled={!series.prev} onClick={() => series.prev?.(lessonMode)} aria-label={t('lesson.previousSequence')}>
            ‹
          </Button>
          <span className={seriesCount}>
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
        <span className={progressCount}>{t('lesson.yourMoves', { value: Math.min(progress.done, progress.total), total: progress.total })}</span>
      )}
      {lessonMode === 'quiz' && (
        <p className={scoreRow}>
          <span className="right">✓ {score.right}</span>
          <span className="wrong">✗ {score.wrong}</span>
          {justRight && !mistake && !done && (
            <span className={css({ ml: '1.5', fontWeight: 'medium', color: 'success' })}>{t('lesson.rightThatIsTheLesson')}</span>
          )}
        </p>
      )}
      {mistakePreview && mistake ? (
        <Card tone={mistakeIsBad(mistake) ? 'bad' : 'good'}>
          <div className={verdictHead}>
            {mistake.verdict && (
              <span className={badge} style={{ ['--label' as string]: LABELS[mistake.verdict.label].color }}>
                {LABELS[mistake.verdict.label].symbol}
              </span>
            )}
            <strong>{mistakeHeadline(moveText(sfen, mistake.usi), mistake)}</strong>
          </div>
          {mistake.note && <p>{mistake.note}</p>}
          {mistake.verdict && mistake.verdict.reasons.length > 0 && (
            <ul className={css({ m: '{spacing.1.5} 0', pl: '4', fontSize: 'sm', lineHeight: 'normal', '& li + li': { mt: '1' } })}>
              {mistake.verdict.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
          {mistake.verdict && !mistake.note && mistake.verdict.reasons.length === 0 && (
            <p>{mistakeIsBad(mistake) ? t('lesson.theOpponentGetsTheBetter') : t('lesson.nothingGoesWrongRightAway')}</p>
          )}
          <p className={muted}>
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
          <Wrap gap="2" align="center">
            <Button variant="primary" onClick={lesson.backToLine}>
              {t('lesson.backToTheLessonLine')}
            </Button>
            <Button onClick={lesson.explore}>{t('lesson.exploreItInAnalyze')}</Button>
          </Wrap>
        </Card>
      ) : whatIf ? (
        <Card>
          <strong>{t('lesson.preview', { whatIf })}</strong>
          <p>{t('lesson.theAiPlaysTheBest')}</p>
        </Card>
      ) : done ? (
        <Card tone="good">
          <strong>{t('lesson.lineComplete')}</strong>
          <Wrap gap="2" align="center">
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
          </Wrap>
          {endComment && (
            <p className={note({ tone: 'end' })}>
              <SquareText text={endComment} />
            </p>
          )}
          <p>{lessonMode === 'quiz' ? quizSummary(score) : jumped ? t('lesson.endOfThisBranchYou') : t('lesson.youHaveSeenTheWhole')}</p>
          {endRate !== null && (
            <p className={endVerdict} data-outcome={endRate >= 0.55 ? 'ahead' : endRate <= 0.45 ? 'behind' : undefined}>
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
              <strong>
                <FlipMarks flipped={flipped}>{t('lesson.yourMoveAs', { side })}</FlipMarks>
              </strong>
              {good.map((g) => (
                <div key={g.usi} className={answer}>
                  <span className={answerMove}>
                    <FlipMarks flipped={flipped}>{moveText(sfen, g.usi)}</FlipMarks>
                  </span>
                  {level === 'new' && <span className={gloss}>{moveGloss(sfen, g.usi)}</span>}
                  {g.note && (
                    <p>
                      <SquareText text={g.note} context={lesson.annotationText} />
                    </p>
                  )}
                </div>
              ))}
              <p className={muted}>{t('lesson.playItOnTheBoard')}</p>
            </>
          ) : (
            <>
              <strong>
                <FlipMarks flipped={flipped}>{lesson.quizTask ?? t('lesson.yourMoveAsFindThe', { side })}</FlipMarks>
              </strong>
              <Button size="sm" variant="ghost" className={css({ alignSelf: 'flex-start', mt: '2' })} onClick={lesson.revealAnswer}>
                {t('lesson.showMeTheAnswer')}
              </Button>
            </>
          )}
          <div className={feedback({ floating: lessonMode === 'study' })} role="status">
            {checking ? (
              <p className={muted}>{t('lesson.checkingThatMove')}</p>
            ) : mistake && !mistakePreview ? (
              <p className={result({ tone: 'wrong' })}>
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
          {level === 'new' && theirs && <span className={gloss}>{moveGloss(sfen, theirs.usi)}</span>}
          {theirs?.note && (
            <p>
              <SquareText text={theirs.note} context={lesson.annotationText} />
            </p>
          )}
          {theirs && (lessonMode === 'study' || !atEnd) ? (
            <Button variant="primary" onClick={() => onPlayReply(theirs.usi)}>
              {t('lesson.playTheirMove')} <Kbd>Space</Kbd>
            </Button>
          ) : (
            <p className={muted}>{theirs ? t('lesson.comingInAMoment') : t('lesson.noBookReply')}</p>
          )}
        </Card>
      )}
      {lastMove && prevSfen && lastNote && !mistakePreview && (
        <div className={last}>
          <span className={muted}>{t('lesson.lastMove', { move: moveText(prevSfen, lastMove) })}</span>
          <p>
            <SquareText text={lastNote} context={lesson.annotationText} />
          </p>
        </div>
      )}
      {!lastMove && course.root.comment && (
        <p className={last}>
          <SquareText text={lessonText(course.root.comment, course.root.commentEn, i18n.language, course) ?? ''} />
        </p>
      )}
      <button className={explore} onClick={lesson.explore}>
        {t('lesson.tryYourOwnMovesFrom')}
        <span>{t('lesson.opensThisPositionInAnalyze')}</span>
      </button>
      {course.source && (
        <details className={sourceNote}>
          <summary>{t('lesson.source')}</summary>
          <p>{course.source}</p>
        </details>
      )}
    </div>
  )
}
