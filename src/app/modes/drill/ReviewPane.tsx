import { useEffect, useMemo, useState } from 'react'
import { Square } from 'tsshogi'
import type { TFunction } from 'i18next'
import { useSession } from '@/app/hooks/session'
import { PIECE_INFO } from '@/app/pieces'
import { useTranslation } from 'react-i18next'
import type { StoredGame } from '@/app/games'
import { YourGames } from './YourGames'
import { courseTitle } from '@/utils/model'
import i18n from '@/utils/i18n'
import { moveText, positionOf } from '@/utils/shogi'
import { sfenAfter, sideMark, squareName } from '@/utils/notation'
import { expectedMoves, reviewCounts, type ReviewItem, type ReviewQueue } from '@/app/practice'
import type { Drill, DrillState } from './useDrill'
import { weaknessOfMistake, type Weakness } from '@/utils/learning'
import { Button } from '@/app/ui/Button'
import { Card } from '@/app/ui/Card'

function untilText(ms: number) {
  const minutes = Math.round(ms / 60000)
  if (minutes < 60) return i18n.t('review.inMin', { minutes })
  const hours = Math.round(minutes / 60)
  if (hours < 48) return i18n.t('review.inH', { hours })
  return i18n.t('review.inDays', { count: Math.round(hours / 24) })
}

function Principle({ tag }: { tag: Weakness }) {
  const { t } = useTranslation()
  if (tag === 'other') return null
  return (
    <p className="app-note">
      <strong>{t(`report.weak.${tag}.name`)}</strong>
      {t('review.principleSep')}
      {t(`report.weak.${tag}.fix`)}
    </p>
  )
}

function pieceHint(sfen: string, usi: string, t: TFunction) {
  const move = positionOf(sfen).createMoveByUSI(usi)
  if (!move) return ''
  const piece = PIECE_INFO[move.pieceType].ja.slice(0, 1)
  return usi[1] === '*' ? t('review.hintDrop', { piece }) : t('review.hintPiece', { piece, square: squareName(Square.newByUSI(usi.slice(0, 2))!) })
}

type Counts = ReturnType<typeof reviewCounts>

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
  const { t, i18n } = useTranslation()
  const expected = moveText(startSfen, expectedMoves(item)[0])
  const lessonNote = item.kind === 'position' ? item.node.branches.find((b) => b.usi === expectedMoves(item)[0])?.note : undefined
  const learning = drill.queue === 'new' && !drill.result && !drill.retry
  const [hint, setHint] = useState(0)
  const session = useSession()
  const best = item.kind === 'mistake' ? item.mistake.best : ''
  useEffect(() => {
    setHint(0)
  }, [item.key, drill.retry])
  useEffect(() => {
    if (hint < 2 || !best || best[1] === '*') return
    const from = Square.newByUSI(best.slice(0, 2))
    const piece = from && positionOf(startSfen).board.at(from)
    if (from && piece) session.setSelection({ from, color: piece.color })
  }, [hint, best, startSfen, session])
  return (
    <>
      <p className="app-muted">
        {t('review.cardOf', { value: drill.index + 1, itemsCount: drill.items.length })}
        {item.kind === 'position' ? t('review.from', { title: courseTitle(item.course, i18n.language) }) : ''}
        {item.kind === 'position' && item.moves.length > 0
          ? t('review.after', {
              move: moveText(item.moves.length > 1 ? sfenAfter(item.course.root.sfen, item.moves.slice(0, -1)) : item.course.root.sfen, item.moves.at(-1)!),
            })
          : ''}
      </p>
      {!drill.result && (
        <p className="app-task">
          {item.kind === 'position'
            ? learning
              ? t('review.newPositionPlayGreenArrow', { move: expected })
              : t('review.yourMoveAsPlayThe', { side: sideMark(item.course.userSide) })
            : t('review.inGameYouPlayed', {
                game: !item.mistake.game ? t('review.thisGame') : item.mistake.game === 'Imported game' ? t('review.anImportedGame') : item.mistake.game,
                move: moveText(item.mistake.sfen, item.mistake.played),
              })}
        </p>
      )}
      {drill.retry && !drill.result && <p className="app-muted">{t('review.retryOnlyYourFirstTry')}</p>}
      {item.kind === 'mistake' && !drill.result && hint > 0 && (
        <div className="app-note">
          {item.mistake.reasons[0] && (
            <p>
              {t('review.hintWhy')}
              {item.mistake.reasons[0]}
            </p>
          )}
          <Principle tag={weaknessOfMistake(item.mistake)} />
          {hint > 1 && <p>{pieceHint(item.mistake.sfen, item.mistake.best, t)}</p>}
        </div>
      )}
      {learning && lessonNote && <p className="app-note">{lessonNote}</p>}
      {drill.result === 'right' && <p className="app-result right">{drill.retry ? t('review.rightThisTimeTheCard') : t('review.rightItComesBackLater')}</p>}
      {drill.result === 'wrong' && (
        <p className={`app-result ${mistakeOk ? 'ok' : 'wrong'}`}>
          {mistakeOk ? t('review.aGoodMoveTooBut', { move: expected }) : t('review.notThisOneTheBetter', { move: expected })}
          {mistakePreview ? t('review.theBoardIsShowingWhat') : t('review.itIsMarkedWithA')}
          {!drill.retry && t('review.thisCardComesBackIn')}
        </p>
      )}
      {drill.result && lessonNote && <p className="app-note">{lessonNote}</p>}
      {item.kind === 'mistake' && drill.result === 'wrong' && !drill.retry && item.mistake.reasons[0] && (
        <p className="app-note">
          {t('review.whyYourGameMoveWas')}
          {item.mistake.reasons[0]}
        </p>
      )}
      {item.kind === 'mistake' && drill.result === 'wrong' && !drill.retry && <Principle tag={weaknessOfMistake(item.mistake)} />}
      <div className="app-actions">
        {item.kind === 'mistake' && !drill.result && hint < 2 && (
          <Button onClick={() => setHint((h) => h + 1)}>{hint === 0 ? t('review.hint') : t('review.moreHint')}</Button>
        )}
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
      <strong>
        {drill && drill.items.length > 0
          ? t('review.doneAnswered', { answered: drill.answered, count: drill.items.length })
          : drill?.queue === 'due'
            ? t('review.nothingDueRightNow')
            : t('review.nothingInThisQueue')}
      </strong>
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
  onReturn,
}: {
  trainer: Drill
  startSfen: string | null
  mistakePreview: boolean
  mistakeOk: boolean
  onOpenGame: (g: StoredGame) => void
  onReturn?: () => void
}) {
  const { t } = useTranslation()
  const { drill, item } = trainer
  const counts = useMemo(() => reviewCounts(), [drill?.queue, drill?.index, drill?.items])
  return (
    <div className="app-practice">
      {trainer.origin && onReturn && (
        <button className="app-back" onClick={onReturn}>
          ‹ {t('review.backToGame')}
        </button>
      )}
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
        <EmptyQueue drill={drill} counts={counts} onQueue={trainer.start} />
      )}
      {!item && <YourGames onOpen={onOpenGame} />}
    </div>
  )
}
