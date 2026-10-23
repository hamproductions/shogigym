import { useMemo } from 'react'
import { SquareText } from '@/app/modes/lesson/SquareText'
import { useTranslation } from 'react-i18next'
import { styled } from 'styled-system/jsx'
import { LABELS, type MoveReview } from '@/utils/analysis'
import { moveCoaching } from '@/utils/coaching'
import type { Course } from '@/utils/model'
import i18n from '@/utils/i18n'
import { moveText } from '@/utils/shogi'
import { FlipMarks } from '@/app/ui/SideMark'
import { useFlipped } from '@/app/hooks/session'
import type { BookHit, BookMove } from '@/utils/book'
import { isWeak } from '@/utils/mistake'
import { weaknessOf } from '@/utils/learning'
import { LabelBadge, Muted, Note, VerdictHead, VerdictTitle } from './panels.styles'

const VerdictLabel = styled('span', { base: { color: 'light-dark(color-mix(in srgb, var(--label) 55%, #000), var(--label))' } })

type CoachPaneProps = {
  review: MoveReview | null
  lastMove?: string
  prevSfen: string | null
  bookLast: BookHit | null
  bookHere: BookMove[]
  sfen: string
  course: Course | null
  onPlay: (usi: string) => void
  canPlay: boolean
  ai: boolean
  showBook: boolean
  you: boolean
}

const prefixOf = (key: string) => i18n.t(key, { move: '\u0000', line: '\u0000' }).split('\u0000')[0]

function Principle({ review }: { review: MoveReview }) {
  const { t } = useTranslation()
  const tag = weaknessOf({ ply: Infinity, ...review })
  if (tag === 'other') return null
  return (
    <Note tone="warn">
      <strong>{t(`report.weak.${tag}.name`)}.</strong> {t(`report.weak.${tag}.fix`)}
    </Note>
  )
}

function Verdict({
  review,
  lastMove,
  prevSfen,
  bookLast,
  ai,
  you,
  showReasons,
}: Pick<CoachPaneProps, 'review' | 'bookLast' | 'ai' | 'you'> & { lastMove: string; prevSfen: string; showReasons: boolean }) {
  const { t } = useTranslation()
  const flipped = useFlipped()
  const played = moveText(prevSfen, lastMove)
  if (review)
    return (
      <>
        <VerdictHead>
          <LabelBadge style={{ ['--label' as string]: LABELS[review.label].color }}>{LABELS[review.label].symbol}</LabelBadge>
          <VerdictTitle>
            {you ? t('coach.yourMove') : ''}
            <FlipMarks flipped={flipped}>{played}</FlipMarks>
          </VerdictTitle>
          <VerdictLabel style={{ ['--label' as string]: LABELS[review.label].color }}>{LABELS[review.label].text}</VerdictLabel>
        </VerdictHead>
        {bookLast?.branch.note && <Note>{bookLast.branch.note}</Note>}
        {bookLast?.branch.kind === 'deviation' && bookLast.branch.punishNote && <Note tone="warn">{bookLast.branch.punishNote}</Note>}
        {(showReasons ? review.reasons.slice(0, 2) : []).map((r) => (
          <styled.p key={r} m="0 0 {spacing.1.5}" fontSize="sm">
            {r}
          </styled.p>
        ))}
        {isWeak(review.label) && <Principle review={review} />}
        {isWeak(review.label) && review.best.move !== lastMove && !review.reasons.some((r) => r.startsWith(prefixOf('moveFacts.bestWins'))) && (
          <styled.p m="0 0 {spacing.1.5}" fontSize="sm">
            {t('coach.betterWas')}
            <strong>
              <FlipMarks flipped={flipped}>{moveText(prevSfen, review.best.move)}</FlipMarks>
            </strong>
            {review.bestReasons[0] && !review.bestReasons[0].startsWith(prefixOf('moveFacts.engineLine'))
              ? `: ${review.bestReasons[0]}`
              : t('coach.betterWasEnd')}
          </styled.p>
        )}
      </>
    )
  if (bookLast && bookLast.branch.kind !== 'deviation')
    return (
      <>
        <VerdictHead>
          <LabelBadge style={{ ['--label' as string]: LABELS.book.color }}>{LABELS.book.symbol}</LabelBadge>
          <VerdictTitle>
            <FlipMarks flipped={flipped}>{played}</FlipMarks>
          </VerdictTitle>
          <VerdictLabel style={{ ['--label' as string]: LABELS.book.color }}>{t('coach.bookMove')}</VerdictLabel>
        </VerdictHead>
        {bookLast.branch.note && <Note>{bookLast.branch.note}</Note>}
      </>
    )
  if (bookLast)
    return (
      <>
        <VerdictHead>
          <LabelBadge style={{ ['--label' as string]: LABELS.mistake.color }}>{LABELS.mistake.symbol}</LabelBadge>
          <VerdictTitle>
            <FlipMarks flipped={flipped}>{played}</FlipMarks>
          </VerdictTitle>
          <VerdictLabel style={{ ['--label' as string]: LABELS.mistake.color }}>{t('coach.knownMistake')}</VerdictLabel>
        </VerdictHead>
        {(bookLast.branch.punishNote ?? bookLast.branch.note) && <Note tone="warn">{bookLast.branch.punishNote ?? bookLast.branch.note}</Note>}
      </>
    )
  return <Muted>{ai ? t('coach.checking', { move: played }) : t('coach.isOffTheBookTurn', { move: played })}</Muted>
}

export function CoachPane({ review, lastMove, prevSfen, bookLast, bookHere, sfen, course, onPlay, canPlay, ai, showBook, you }: CoachPaneProps) {
  const { t, i18n } = useTranslation()
  const flipped = useFlipped()
  const feedback = useMemo(() => (lastMove && prevSfen ? moveCoaching(prevSfen, lastMove, i18n.language) : null), [lastMove, prevSfen, i18n.language])
  return (
    <div className="app-coach">
      {lastMove && prevSfen ? (
        <div className="app-verdict">
          <Verdict review={review} lastMove={lastMove} prevSfen={prevSfen} bookLast={bookLast} ai={ai} you={you} showReasons={!feedback} />
        </div>
      ) : (
        <Muted>{course ? (course.root.comment ?? course.goalFormation) : t('coach.makeAMoveTheCoach')}</Muted>
      )}
      {feedback && (
        <styled.section mt="3" aria-label={t(`coach.live.patterns.${feedback.pattern}`)}>
          <styled.p m="0 0 {spacing.1}" color="fg.muted" fontSize="xs" fontWeight="bold">
            {t(`coach.live.patterns.${feedback.pattern}`)}
          </styled.p>
          <styled.p m="0 0 {spacing.2}">
            <SquareText text={feedback.summary} context={`${feedback.summary}\n${feedback.detail}`} />
          </styled.p>
          <styled.details fontSize="sm">
            <styled.summary cursor="pointer">{t('coach.live.more')}</styled.summary>
            <styled.p m="{spacing.2} 0">
              <SquareText text={feedback.detail} context={`${feedback.summary}\n${feedback.detail}`} />
            </styled.p>
          </styled.details>
        </styled.section>
      )}
      {showBook && bookHere.length > 0 && (
        <styled.div mt="5">
          <styled.h3 m="0 0 {spacing.1.5}" color="fg.muted" fontSize="sm" fontWeight="medium">
            {t('coach.bookMovesFromTheLessons')}
          </styled.h3>
          {bookHere.map((b) => (
            <styled.button
              key={b.usi}
              display="block"
              w="100%"
              mb="1.5"
              p="{spacing.2.5} {spacing.3}"
              borderRadius="md"
              bg="surface.2"
              textAlign="left"
              disabled={!canPlay}
              onClick={() => onPlay(b.usi)}
            >
              <styled.strong display="block" fontFamily="mincho" fontWeight="heavy" fontSize="md">
                <FlipMarks flipped={flipped} muted>
                  {moveText(sfen, b.usi)}
                </FlipMarks>
              </styled.strong>
              {b.note && (
                <styled.span fontFamily="mincho" fontSize="sm" color="fg.muted">
                  {b.note}
                </styled.span>
              )}
            </styled.button>
          ))}
        </styled.div>
      )}
    </div>
  )
}
