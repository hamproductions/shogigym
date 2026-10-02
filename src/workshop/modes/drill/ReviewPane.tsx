import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { StoredGame } from '../../games'
import { YourGames } from './YourGames'
import { courseTitle } from '../../../model'
import i18n from '../../../i18n'
import { moveText } from '../../../shogi'
import { sfenAfter, sideMark } from '../../lib/notation'
import { expectedMoves, reviewCounts, type ReviewItem, type ReviewQueue } from '../../practice'
import type { Drill, DrillState } from './useDrill'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { Segmented } from '../../ui/Segmented'

function untilText(ms: number) {
  const minutes = Math.round(ms / 60000)
  if (minutes < 60) return i18n.t('review.inMin', { minutes })
  const hours = Math.round(minutes / 60)
  if (hours < 48) return i18n.t('review.inH', { hours })
  return i18n.t('review.inDays', { count: Math.round(hours / 24) })
}

type Counts = ReturnType<typeof reviewCounts>

function ReviewCard({ drill, item, startSfen, onNext, onRetry, mistakePreview, mistakeOk }: { drill: DrillState; item: ReviewItem; startSfen: string; onNext: () => void; onRetry: () => void; mistakePreview: boolean; mistakeOk: boolean }) {
  const { t, i18n } = useTranslation()
  const expected = moveText(startSfen, expectedMoves(item)[0])
  const lessonNote = item.kind === 'position' ? item.node.branches.find((b) => b.usi === expectedMoves(item)[0])?.note : undefined
  const learning = drill.queue === 'new' && !drill.result && !drill.retry
  return (
    <>
      <p className="ws-muted">
        {t('review.cardOf', { value: drill.index + 1, itemsCount: drill.items.length })}
        {item.kind === 'position' ? t('review.from', { title: courseTitle(item.course, i18n.language) }) : ''}
        {item.kind === 'position' && item.moves.length > 0 ? t('review.after', { move: moveText(item.moves.length > 1 ? sfenAfter(item.course.root.sfen, item.moves.slice(0, -1)) : item.course.root.sfen, item.moves.at(-1)!) }) : ''}
      </p>
      {!drill.result && <p className="ws-task">{item.kind === 'position' ? (learning ? t('review.newPositionPlayGreenArrow', { move: expected }) : t('review.yourMoveAsPlayThe', { side: sideMark(item.course.userSide) })) : t('review.inGameYouPlayed', { game: item.mistake.game === 'Imported game' ? t('review.anImportedGame') : item.mistake.game, move: moveText(item.mistake.sfen, item.mistake.played) })}</p>}
      {drill.retry && !drill.result && <p className="ws-muted">{t('review.retryOnlyYourFirstTry')}</p>}
      {learning && lessonNote && <p className="ws-note">{lessonNote}</p>}
      {drill.result === 'right' && <p className="ws-result right">{drill.retry ? t('review.rightThisTimeTheCard') : t('review.rightItComesBackLater')}</p>}
      {drill.result === 'wrong' && (
        <p className={`ws-result ${mistakeOk ? 'ok' : 'wrong'}`}>
          {mistakeOk ? t('review.aGoodMoveTooBut', { move: expected }) : t('review.notThisOneTheBetter', { move: expected })}
          {mistakePreview ? t('review.theBoardIsShowingWhat') : t('review.itIsMarkedWithA')}
          {!drill.retry && t('review.thisCardComesBackIn')}
        </p>
      )}
      {drill.result && lessonNote && <p className="ws-note">{lessonNote}</p>}
      {item.kind === 'mistake' && drill.result === 'wrong' && !drill.retry && item.mistake.reasons[0] && (
        <p className="ws-note">
          {t('review.whyYourGameMoveWas')}
          {item.mistake.reasons[0]}
        </p>
      )}
      <div className="ws-actions">
        {drill.result && <Button onClick={onRetry}>{t('review.tryItAgain')}</Button>}
        <Button variant={drill.result ? 'primary' : 'secondary'} onClick={onNext}>
          {drill.result ? t('review.nextCard') : t('review.skip')}
        </Button>
      </div>
    </>
  )
}

function EmptyQueue({ drill, counts, onQueue }: { drill: DrillState | null; counts: Counts; onQueue: (q: ReviewQueue) => void }) {
  const { t } = useTranslation()
  const now = Date.now()
  return (
    <Card>
      <strong>{drill && drill.items.length > 0 ? t('review.doneAnswered', { answered: drill.answered, count: drill.items.length }) : drill?.queue === 'due' ? t('review.nothingDueRightNow') : t('review.nothingInThisQueue')}</strong>
      {counts.new > 0 && drill?.queue !== 'new' && (
        <Button variant="primary" onClick={() => onQueue('new')}>
          {t('review.learnNewPositions', { count: Math.min(10, counts.new) })}
        </Button>
      )}
      {counts.started > 0 && Number.isFinite(counts.nextDue) && counts.nextDue > now && <p>{t('review.inSchedule', { count: counts.started, when: untilText(counts.nextDue - now) })}</p>}
      {drill?.queue === 'mistakes' && counts.mistakes === 0 && <p>{t('review.yourOwnMistakesLandHere')}</p>}
      {drill?.queue === 'difficult' && <p>{t('review.aPositionLandsHereAfter')}</p>}
      {counts.started === 0 && drill?.queue !== 'mistakes' && drill?.queue !== 'difficult' && <p>{t('review.positionsYouQuizInOpenings')}</p>}
    </Card>
  )
}

export function ReviewPane({ trainer, startSfen, mistakePreview, mistakeOk, onOpenGame }: { trainer: Drill; startSfen: string | null; mistakePreview: boolean; mistakeOk: boolean; onOpenGame: (g: StoredGame) => void }) {
  const { t } = useTranslation()
  const { drill, item } = trainer
  const counts = useMemo(() => reviewCounts(), [drill?.queue, drill?.index, drill?.items])
  const queues: { id: ReviewQueue; label: string; n: number }[] = [
    { id: 'due', label: t('review.due'), n: counts.due },
    { id: 'new', label: t('review.learnNew'), n: counts.new },
    { id: 'difficult', label: t('review.difficult'), n: counts.difficult },
    { id: 'mistakes', label: t('review.myGameMistakes'), n: counts.mistakes },
  ]
  return (
    <div className="ws-practice">
      <Segmented<ReviewQueue | ''>
        label={t('review.reviewQueue')}
        value={drill?.queue ?? ''}
        options={queues.map((q) => ({
          v: q.id,
          t: (
            <>
              {q.label} <span>{q.n > 99 ? '99+' : q.n}</span>
            </>
          ),
        }))}
        onChange={(q) => q && trainer.start(q)}
      />
      {item && startSfen && drill ? <ReviewCard drill={drill} item={item} startSfen={startSfen} onNext={trainer.next} onRetry={trainer.retry} mistakePreview={mistakePreview} mistakeOk={mistakeOk} /> : <EmptyQueue drill={drill} counts={counts} onQueue={trainer.start} />}
      {!item && <YourGames onOpen={onOpenGame} />}
    </div>
  )
}
