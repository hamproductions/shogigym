import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import type { StoredGame } from '@/app/games'
import { YourGames } from './YourGames'
import { courseTitle } from '@/utils/model'
import i18n from '@/utils/i18n'
import { moveText } from '@/utils/shogi'
import { sfenAfter, sideMark } from '@/utils/notation'
import { expectedMoves, reviewCounts, type ReviewItem, type ReviewQueue } from '@/app/practice'
import type { Drill, DrillState } from './useDrill'
import { Button } from '@/app/ui/Button'
import { Card } from '@/app/ui/Card'

function untilText(ms: number) {
  const minutes = Math.round(ms / 60000)
  if (minutes < 60) return i18n.t('review.inMin', { minutes })
  const hours = Math.round(minutes / 60)
  if (hours < 48) return i18n.t('review.inH', { hours })
  return i18n.t('review.inDays', { count: Math.round(hours / 24) })
}

function taskText(t: TFunction, item: ReviewItem, learning: boolean, expected: string) {
  if (item.kind === 'mistake') {
    return t('review.inGameYouPlayed', {
      game: item.mistake.game === 'Imported game' ? t('review.anImportedGame') : item.mistake.game,
      move: moveText(item.mistake.sfen, item.mistake.played),
    })
  }
  if (learning) return t('review.newPositionPlayGreenArrow', { move: expected })
  return t('review.yourMoveAsPlayThe', { side: sideMark(item.course.userSide) })
}

function emptyHeading(t: TFunction, drill: DrillState | null) {
  if (drill && drill.items.length > 0) return t('review.doneAnswered', { answered: drill.answered, count: drill.items.length })
  return drill?.queue === 'due' ? t('review.nothingDueRightNow') : t('review.nothingInThisQueue')
}

function CardHeader({ drill, item }: { drill: DrillState; item: ReviewItem }) {
  const {
    t,
    i18n: { language },
  } = useTranslation()
  return (
    <p className="app-muted">
      {t('review.cardOf', { value: drill.index + 1, itemsCount: drill.items.length })}
      {item.kind === 'position' ? t('review.from', { title: courseTitle(item.course, language) }) : ''}
      {item.kind === 'position' && item.moves.length > 0
        ? t('review.after', {
            move: moveText(item.moves.length > 1 ? sfenAfter(item.course.root.sfen, item.moves.slice(0, -1)) : item.course.root.sfen, item.moves.at(-1)!),
          })
        : ''}
    </p>
  )
}

function ReviewResult({ drill, expected, mistakePreview, mistakeOk }: { drill: DrillState; expected: string; mistakePreview: boolean; mistakeOk: boolean }) {
  const { t } = useTranslation()
  if (drill.result === 'right') return <p className="app-result right">{drill.retry ? t('review.rightThisTimeTheCard') : t('review.rightItComesBackLater')}</p>
  if (drill.result !== 'wrong') return null
  return (
    <p className={`app-result ${mistakeOk ? 'ok' : 'wrong'}`}>
      {mistakeOk ? t('review.aGoodMoveTooBut', { move: expected }) : t('review.notThisOneTheBetter', { move: expected })}
      {mistakePreview ? t('review.theBoardIsShowingWhat') : t('review.itIsMarkedWithA')}
      {!drill.retry && t('review.thisCardComesBackIn')}
    </p>
  )
}

function WhyNote({ drill, item }: { drill: DrillState; item: ReviewItem }) {
  const { t } = useTranslation()
  if (item.kind !== 'mistake' || drill.result !== 'wrong' || drill.retry || !item.mistake.reasons[0]) return null
  return (
    <p className="app-note">
      {t('review.whyYourGameMoveWas')}
      {item.mistake.reasons[0]}
    </p>
  )
}

function ReviewActions({ answered, onRetry, onNext }: { answered: boolean; onRetry: () => void; onNext: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="app-actions">
      {answered && <Button onClick={onRetry}>{t('review.tryItAgain')}</Button>}
      <Button variant={answered ? 'primary' : 'secondary'} onClick={onNext}>
        {answered ? t('review.nextCard') : t('review.skip')}
      </Button>
    </div>
  )
}

function ReviewCard({
  drill,
  item,
  startSfen,
  onNext,
  onRetry,
  mistakePreview,
  mistakeOk,
}: {
  drill: DrillState
  item: ReviewItem
  startSfen: string
  onNext: () => void
  onRetry: () => void
  mistakePreview: boolean
  mistakeOk: boolean
}) {
  const { t } = useTranslation()
  const expected = moveText(startSfen, expectedMoves(item)[0])
  const lessonNote = item.kind === 'position' ? item.node.branches.find((b) => b.usi === expectedMoves(item)[0])?.note : undefined
  const learning = drill.queue === 'new' && !drill.result && !drill.retry
  return (
    <>
      <CardHeader drill={drill} item={item} />
      {!drill.result && <p className="app-task">{taskText(t, item, learning, expected)}</p>}
      {drill.retry && !drill.result && <p className="app-muted">{t('review.retryOnlyYourFirstTry')}</p>}
      {learning && lessonNote && <p className="app-note">{lessonNote}</p>}
      <ReviewResult drill={drill} expected={expected} mistakePreview={mistakePreview} mistakeOk={mistakeOk} />
      {drill.result && lessonNote && <p className="app-note">{lessonNote}</p>}
      <WhyNote drill={drill} item={item} />
      <ReviewActions answered={!!drill.result} onRetry={onRetry} onNext={onNext} />
    </>
  )
}

function EmptyQueue({ drill, onQueue }: { drill: DrillState | null; onQueue: (q: ReviewQueue) => void }) {
  const { t } = useTranslation()
  const counts = reviewCounts()
  const { now } = counts
  return (
    <Card>
      <strong>{emptyHeading(t, drill)}</strong>
      {counts.new > 0 && drill?.queue !== 'new' && (
        <Button variant="primary" onClick={() => onQueue('new')}>
          {t('review.learnNewPositions', { count: Math.min(10, counts.new) })}
        </Button>
      )}
      {counts.started > 0 && Number.isFinite(counts.nextDue) && counts.nextDue > now && (
        <p>{t('review.inSchedule', { count: counts.started, when: untilText(counts.nextDue - now) })}</p>
      )}
      {drill?.queue === 'mistakes' && counts.mistakes === 0 && <p>{t('review.yourOwnMistakesLandHere')}</p>}
      {drill?.queue === 'difficult' && <p>{t('review.aPositionLandsHereAfter')}</p>}
      {counts.started === 0 && drill?.queue !== 'mistakes' && drill?.queue !== 'difficult' && <p>{t('review.positionsYouQuizInOpenings')}</p>}
    </Card>
  )
}

export function ReviewPane({
  trainer,
  startSfen,
  mistakePreview,
  mistakeOk,
  onOpenGame,
}: {
  trainer: Drill
  startSfen: string | null
  mistakePreview: boolean
  mistakeOk: boolean
  onOpenGame: (g: StoredGame) => void
}) {
  const { drill, item } = trainer
  return (
    <div className="app-practice">
      {item && startSfen && drill ? (
        <ReviewCard
          drill={drill}
          item={item}
          startSfen={startSfen}
          onNext={trainer.next}
          onRetry={trainer.retry}
          mistakePreview={mistakePreview}
          mistakeOk={mistakeOk}
        />
      ) : (
        <EmptyQueue drill={drill} onQueue={trainer.start} />
      )}
      {!item && <YourGames onOpen={onOpenGame} />}
    </div>
  )
}
