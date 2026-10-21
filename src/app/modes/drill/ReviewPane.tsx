import { useEffect, useMemo, useState } from 'react'
import { Square } from 'tsshogi'
import type { TFunction } from 'i18next'
import { useSession } from '@/app/hooks/session'
import { PIECE_INFO } from '@/app/pieces'
import { useTranslation } from 'react-i18next'
import { Wrap } from 'styled-system/jsx'
import type { StoredGame } from '@/app/games'
import { YourGames } from './YourGames'
import { courseTitle } from '@/utils/model'
import i18n from '@/utils/i18n'
import { moveText, positionOf } from '@/utils/shogi'
import { sfenAfter, sideMark, squareName } from '@/utils/notation'
import { expectedMoves, reviewCounts, type ReviewItem, type ReviewQueue } from '@/app/practice'
import type { Drill, DrillState } from './useDrill'
import { weaknessOfMistake, type Weakness } from '@/utils/learning'
import { figureMarks } from '@/app/modes/lesson/figureMarks'
import { SquareText } from '@/app/modes/lesson/SquareText'
import { Button } from '@/app/ui/Button'
import { Card } from '@/app/ui/Card'
import { BackLink, Muted, NarrowColumn, Note, Result, TaskText } from '@/app/panels/panels.styles'
import { Marks } from '@/app/ui/SideMark'

function untilText(ms: number) {
  const minutes = Math.round(ms / 60000)
  if (minutes < 60) return i18n.t('review.inMin', { minutes })
  const hours = Math.round(minutes / 60)
  if (hours < 48) return i18n.t('review.inH', { hours })
  return i18n.t('review.inDays', { count: Math.round(hours / 24) })
}

function Principle({ tag, spaced }: { tag: Weakness; spaced?: boolean }) {
  const { t } = useTranslation()
  if (tag === 'other') return null
  return (
    <Note mt={spaced ? '3' : undefined}>
      <strong>{t(`report.weak.${tag}.name`)}</strong>
      {t('review.principleSep')}
      {t(`report.weak.${tag}.fix`)}
    </Note>
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
  const task = drill.result
    ? ''
    : item.kind === 'position'
      ? learning
        ? t('review.newPositionPlayGreenArrow', { move: expected })
        : t('review.yourMoveAsPlayThe', { side: sideMark(item.course.userSide) })
      : t('review.inGameYouPlayed', {
          game: !item.mistake.game ? t('review.thisGame') : item.mistake.game === 'Imported game' ? t('review.anImportedGame') : item.mistake.game,
          move: moveText(item.mistake.sfen, item.mistake.played),
        })
  const { setSourceMarks } = session
  useEffect(() => {
    setSourceMarks(task ? figureMarks([], startSfen, false, task) : null)
    return () => setSourceMarks(null)
  }, [task, startSfen, setSourceMarks])
  return (
    <>
      <Muted css={{ '* + &': { mt: '3' } }}>
        {t('review.cardOf', { value: drill.index + 1, itemsCount: drill.items.length })}
        {item.kind === 'position' ? t('review.from', { title: courseTitle(item.course, i18n.language) }) : ''}
        <Marks>
          {item.kind === 'position' && item.moves.length > 0
            ? t('review.after', {
                move: moveText(item.moves.length > 1 ? sfenAfter(item.course.root.sfen, item.moves.slice(0, -1)) : item.course.root.sfen, item.moves.at(-1)!),
              })
            : ''}
        </Marks>
      </Muted>
      {task && (
        <TaskText mt="3">
          <SquareText text={task} />
        </TaskText>
      )}
      {drill.retry && !drill.result && <Muted mt="3">{t('review.retryOnlyYourFirstTry')}</Muted>}
      {item.kind === 'mistake' && !drill.result && hint > 0 && (
        <Note as="div" mt="3">
          {item.mistake.reasons[0] && (
            <p>
              {t('review.hintWhy')}
              <Marks>{item.mistake.reasons[0]}</Marks>
            </p>
          )}
          <Principle tag={weaknessOfMistake(item.mistake)} />
          {hint > 1 && (
            <p>
              <Marks>{pieceHint(item.mistake.sfen, item.mistake.best, t)}</Marks>
            </p>
          )}
        </Note>
      )}
      {learning && lessonNote && (
        <Note mt="3">
          <Marks>{lessonNote}</Marks>
        </Note>
      )}
      {drill.result === 'right' && (
        <Result tone="right" mt="3">
          {drill.retry ? t('review.rightThisTimeTheCard') : t('review.rightItComesBackLater')}
        </Result>
      )}
      {drill.result === 'wrong' && (
        <Result tone={mistakeOk ? 'right' : 'wrong'} mt="3">
          <Marks>{mistakeOk ? t('review.aGoodMoveTooBut', { move: expected }) : t('review.notThisOneTheBetter', { move: expected })}</Marks>
          {mistakePreview ? t('review.theBoardIsShowingWhat') : t('review.itIsMarkedWithA')}
          {!drill.retry && t('review.thisCardComesBackIn')}
        </Result>
      )}
      {drill.result && lessonNote && (
        <Note mt="3">
          <Marks>{lessonNote}</Marks>
        </Note>
      )}
      {item.kind === 'mistake' && drill.result === 'wrong' && !drill.retry && item.mistake.reasons[0] && (
        <Note mt="3">
          {t('review.whyYourGameMoveWas')}
          <Marks>{item.mistake.reasons[0]}</Marks>
        </Note>
      )}
      {item.kind === 'mistake' && drill.result === 'wrong' && !drill.retry && <Principle tag={weaknessOfMistake(item.mistake)} spaced />}
      <Wrap gap="2" align="center" mt="3" _narrow={{ order: '-1' }}>
        {item.kind === 'mistake' && !drill.result && hint < 2 && (
          <Button onClick={() => setHint((h) => h + 1)}>{hint === 0 ? t('review.hint') : t('review.moreHint')}</Button>
        )}
        {drill.result && <Button onClick={onRetry}>{t('review.tryItAgain')}</Button>}
        <Button variant={drill.result ? 'primary' : 'secondary'} onClick={onNext}>
          {drill.result ? t('review.nextCard') : t('review.skip')}
        </Button>
      </Wrap>
    </>
  )
}

function EmptyQueue({ drill, counts, onQueue }: { drill: DrillState | null; counts: Counts; onQueue: (q: ReviewQueue) => void }) {
  const { t } = useTranslation()
  const now = Date.now()
  return (
    <Card css={{ '* + &': { mt: '3' } }}>
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
    <NarrowColumn>
      {trainer.origin && onReturn && <BackLink onClick={onReturn}>‹ {t('review.backToGame')}</BackLink>}
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
    </NarrowColumn>
  )
}
