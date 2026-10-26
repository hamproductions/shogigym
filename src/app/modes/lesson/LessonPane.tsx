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
import { Kbd } from '@/components/ui'
import { Box, styled, Wrap } from 'styled-system/jsx'
import { BackLink, LabelBadge, Muted, NarrowColumn, Note, Result, VerdictHead, VerdictTitle } from '@/app/panels/panels.styles'
import { feedback, paneCard } from './lesson.styles'
import { courseProgress } from '@/app/practice'
import type { LessonMode } from '@/app/types'
import { RANDOM_KEY, store, stored } from './reading'
import { OpeningPicker } from './OpeningPicker'
import { LessonGuide } from './LessonGuide'
import type { Lesson } from './useLesson'
import { Marks } from '@/app/ui/SideMark'

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
  const { course, liveSfen: sfen, userSide, lastMove, prevSfen, playing, preview, atEnd, flipped } = useSession()
  const { lessonMode, score, justRight, checking, progress, done, asking, offBook, good, showAnswer, jumped } = lesson
  if (!course) return <OpeningPicker onOpen={lesson.open} level={level} setupId={lesson.pickerSetup} setSetupId={lesson.setPickerSetup} />
  const side = sideMark(userSide)
  const series = seriesOf(course, lesson)
  const nextCourse = series ? null : nextCourseAfter(course)
  const whatIf = preview && !mistake ? preview.title : null
  const theirs = reply ?? mainBranch(lesson.node)
  const endComment = done ? lesson.node?.comment : undefined
  const card = paneCard({ study: lessonMode === 'study' })
  if (setupOf(course)?.path && lessonMode === 'study' && !(mistakePreview && mistake) && !offBook && !whatIf)
    return (
      <NarrowColumn>
        <LessonGuide course={course} lesson={lesson} series={series} />
      </NarrowColumn>
    )
  return (
    <NarrowColumn>
      {series && (
        <styled.nav display="flex" flexWrap="wrap" alignItems="center" gap="2" mb="2" fontSize="sm" fontWeight="bold" aria-label={t('lesson.series')}>
          <BackLink flexBasis="100%" textAlign="left" onClick={series.back}>
            ‹ {t('lesson.backToArticle')}
          </BackLink>
          <Button size="sm" disabled={!series.prev} onClick={() => series.prev?.(lessonMode)} aria-label={t('lesson.previousSequence')}>
            ‹
          </Button>
          <styled.span minWidth="7em" textAlign="center" fontVariantNumeric="tabular-nums">
            {series.tally
              ? t('lesson.randomTally', { count: series.tally.questions + 1, right: series.tally.right, wrong: series.tally.wrong })
              : t('lesson.sequenceOf', { value: series.at + 1, total: series.total })}
          </styled.span>
          <Button size="sm" disabled={!series.next} onClick={() => series.next?.(lessonMode)} aria-label={t('lesson.nextSequence')}>
            ›
          </Button>
          {series.shuffle && !series.random && (
            <Button size="sm" variant="ghost" onClick={series.shuffle}>
              {t('lesson.randomQuiz')}
            </Button>
          )}
        </styled.nav>
      )}
      {progress && progress.total > 0 && (
        <styled.span color="fg.muted" fontSize="xs" fontWeight="bold">
          {t('lesson.yourMoves', { value: Math.min(progress.done, progress.total), total: progress.total })}
        </styled.span>
      )}
      {lessonMode === 'quiz' && (
        <styled.p
          display="flex"
          gap="3"
          m="{spacing.2.5} 0 0"
          fontWeight="bold"
          h="calc(1em * {lineHeights.normal})"
          overflowX="auto"
          whiteSpace="nowrap"
          flexShrink="0"
          _narrow={{ order: '-2', m: '0 0 {spacing.2.5}' }}
        >
          <styled.span className="right" flexShrink="0" color="success">
            ✓ {score.right}
          </styled.span>
          <styled.span className="wrong" flexShrink="0" color="danger">
            ✗ {score.wrong}
          </styled.span>
          {justRight && !mistake && !done && (
            <styled.span flexShrink="0" ml="1.5" fontWeight="medium" color="success">
              {t('lesson.rightThatIsTheLesson')}
            </styled.span>
          )}
        </styled.p>
      )}
      {mistakePreview && mistake ? (
        <Card tone={mistakeIsBad(mistake) ? 'bad' : 'good'} className={card}>
          <VerdictHead>
            {mistake.verdict && (
              <LabelBadge style={{ ['--label' as string]: LABELS[mistake.verdict.label].color }}>{LABELS[mistake.verdict.label].symbol}</LabelBadge>
            )}
            <VerdictTitle>
              <Marks>{mistakeHeadline(moveText(sfen, mistake.usi), mistake)}</Marks>
            </VerdictTitle>
          </VerdictHead>
          {mistake.note && (
            <p>
              <Marks>{mistake.note}</Marks>
            </p>
          )}
          {mistake.verdict && mistake.verdict.reasons.length > 0 && (
            <styled.ul m="{spacing.1.5} 0" pl="4" fontSize="sm" lineHeight="normal">
              {mistake.verdict.reasons.map((r) => (
                <styled.li key={r} css={{ '&:not(:first-child)': { mt: '1' } }}>
                  <Marks>{r}</Marks>
                </styled.li>
              ))}
            </styled.ul>
          )}
          {mistake.verdict && !mistake.note && mistake.verdict.reasons.length === 0 && (
            <p>{mistakeIsBad(mistake) ? t('lesson.theOpponentGetsTheBetter') : t('lesson.nothingGoesWrongRightAway')}</p>
          )}
          <Muted>
            <Marks>
              {lessonMode === 'study'
                ? mistake.verdict && mistake.verdict.best.move !== mistake.expected && mistake.verdict.best.move !== mistake.usi
                  ? t('lesson.theLessonMoveIsThe', { move: moveText(sfen, mistake.expected), move2: moveText(sfen, mistake.verdict.best.move) })
                  : t('lesson.theLessonMoveIs', { move: moveText(sfen, mistake.expected) })
                : ''}
            </Marks>
            {playing ? t('lesson.theBoardIsPlayingOut') : t('lesson.thatIsHowItContinues')}
          </Muted>
          <Button variant="primary" onClick={onBack}>
            {t('lesson.goBackAndTryAgain')}
          </Button>
        </Card>
      ) : offBook ? (
        <Card className={card}>
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
        <Card className={card}>
          <strong>
            <Marks>{t('lesson.preview', { whatIf })}</Marks>
          </strong>
          <p>{t('lesson.theAiPlaysTheBest')}</p>
        </Card>
      ) : done ? (
        <Card tone="good" className={card}>
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
            <Note tone="end">
              <SquareText text={endComment} />
            </Note>
          )}
          <p>{lessonMode === 'quiz' ? quizSummary(score) : jumped ? t('lesson.endOfThisBranchYou') : t('lesson.youHaveSeenTheWhole')}</p>
          {endRate !== null && (
            <styled.p
              fontWeight="bold"
              css={{ '&[data-outcome=ahead]': { color: 'success' }, '&[data-outcome=behind]': { color: 'danger' } }}
              data-outcome={endRate >= 0.55 ? 'ahead' : endRate <= 0.45 ? 'behind' : undefined}
            >
              {endRate >= 0.55
                ? t('lesson.aiSViewOfThe', { value: Math.round(endRate * 100) })
                : endRate <= 0.45
                  ? t('lesson.aiSViewOfThe2', { value: Math.round(endRate * 100) })
                  : t('lesson.aiSViewOfThe3', { value: Math.round(endRate * 100) })}
            </styled.p>
          )}
        </Card>
      ) : asking ? (
        <Card className={card}>
          {lessonMode === 'study' || showAnswer ? (
            <>
              <strong>
                <FlipMarks flipped={flipped}>{t('lesson.yourMoveAs', { side })}</FlipMarks>
              </strong>
              {good.map((g) => (
                <Box key={g.usi} mt="1.5">
                  <styled.span color="success" fontFamily="mincho" fontWeight="heavy" fontSize="xl">
                    <FlipMarks flipped={flipped}>{moveText(sfen, g.usi)}</FlipMarks>
                  </styled.span>
                  {level === 'new' && (
                    <styled.span display="block" color="fg.muted" fontSize="xs">
                      {moveGloss(sfen, g.usi)}
                    </styled.span>
                  )}
                  {g.note && (
                    <styled.p m="{spacing.0.5} 0 0" fontFamily="mincho">
                      <SquareText text={g.note} context={lesson.annotationText} />
                    </styled.p>
                  )}
                </Box>
              ))}
              <Muted>{t('lesson.playItOnTheBoard')}</Muted>
            </>
          ) : (
            <>
              <strong>
                <FlipMarks flipped={flipped}>{lesson.quizTask ?? t('lesson.yourMoveAsFindThe', { side })}</FlipMarks>
              </strong>
              <Button size="sm" variant="ghost" alignSelf="flex-start" mt="2" onClick={lesson.revealAnswer}>
                {t('lesson.showMeTheAnswer')}
              </Button>
            </>
          )}
          <div className={feedback({ floating: lessonMode === 'study' })} role="status">
            {checking ? (
              <Muted m="0">{t('lesson.checkingThatMove')}</Muted>
            ) : mistake && !mistakePreview ? (
              <Result tone="wrong">
                <Marks>
                  {mistakeIsBad(mistake)
                    ? t('lesson.wasLabel', {
                        move: moveText(sfen, mistake.usi),
                        label: (mistake.verdict ? LABELS[mistake.verdict.label] : LABELS.mistake).text,
                      })
                    : t('lesson.isNotThisLessonS', { move: moveText(sfen, mistake.usi) })}
                </Marks>
              </Result>
            ) : null}
          </div>
        </Card>
      ) : (
        <Card className={card}>
          <strong>
            <Marks>{theirs ? t('lesson.theirMove', { move: moveText(sfen, theirs.usi) }) : t('lesson.theirMove2')}</Marks>
          </strong>
          {level === 'new' && theirs && (
            <styled.span display="block" color="fg.muted" fontSize="xs">
              {moveGloss(sfen, theirs.usi)}
            </styled.span>
          )}
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
            <Muted>{theirs ? t('lesson.comingInAMoment') : t('lesson.noBookReply')}</Muted>
          )}
        </Card>
      )}
      {lastMove && prevSfen && lastNote && !mistakePreview && (
        <Box m="{spacing.3} 0 0" fontFamily="mincho" fontSize="sm" lineHeight="mincho">
          <Muted as="span">
            <Marks>{t('lesson.lastMove', { move: moveText(prevSfen, lastMove) })}</Marks>
          </Muted>
          <styled.p m="{spacing.0.5} 0 0">
            <SquareText text={lastNote} context={lesson.annotationText} />
          </styled.p>
        </Box>
      )}
      {!lastMove && course.root.comment && (
        <styled.p m="{spacing.3} 0 0" fontFamily="mincho" fontSize="sm" lineHeight="mincho">
          <SquareText text={lessonText(course.root.comment, course.root.commentEn, i18n.language, course) ?? ''} />
        </styled.p>
      )}
      <styled.button
        display="block"
        w="100%"
        mt="3"
        p="{spacing.2.5} {spacing.3}"
        border="1px dashed {colors.border.strong}"
        borderRadius="lg"
        textAlign="left"
        fontWeight="bold"
        fontSize="sm"
        transition="background {durations.fast}"
        _hover={{ bg: 'surface.2' }}
        onClick={lesson.explore}
      >
        {t('lesson.tryYourOwnMovesFrom')}
        <styled.span display="block" fontWeight="regular" fontSize="xs" color="fg.muted">
          {t('lesson.opensThisPositionInAnalyze')}
        </styled.span>
      </styled.button>
      {course.source && (
        <styled.details mt="4" color="fg.muted" fontSize="xs">
          <styled.summary cursor="pointer">{t('lesson.source')}</styled.summary>
          <styled.p m="{spacing.1.5} 0 0">{course.source}</styled.p>
        </styled.details>
      )}
    </NarrowColumn>
  )
}
