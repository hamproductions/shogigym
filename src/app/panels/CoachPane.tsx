import { useTranslation } from 'react-i18next'
import { styled } from 'styled-system/jsx'
import { LABELS, type MoveReview } from '@/utils/analysis'
import type { Course } from '@/utils/model'
import i18n from '@/utils/i18n'
import { moveText } from '@/utils/shogi'
import { FlipMarks } from '@/app/ui/SideMark'
import { useFlipped } from '@/app/hooks/session'
import type { BookHit, BookMove } from '@/utils/book'
import { isWeak } from '@/utils/mistake'
import { weaknessOf } from '@/utils/learning'
import { badge, muted, note, verdictHead, verdictLabel } from './panels.styles'

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
    <p className={note({ tone: 'warn' })}>
      <strong>{t(`report.weak.${tag}.name`)}.</strong> {t(`report.weak.${tag}.fix`)}
    </p>
  )
}

function Verdict({
  review,
  lastMove,
  prevSfen,
  bookLast,
  ai,
  you,
}: Pick<CoachPaneProps, 'review' | 'bookLast' | 'ai' | 'you'> & { lastMove: string; prevSfen: string }) {
  const { t } = useTranslation()
  const flipped = useFlipped()
  const played = moveText(prevSfen, lastMove)
  if (review)
    return (
      <>
        <div className={verdictHead}>
          <span className={badge} style={{ ['--label' as string]: LABELS[review.label].color }}>
            {LABELS[review.label].symbol}
          </span>
          <strong>
            {you ? t('coach.yourMove') : ''}
            <FlipMarks flipped={flipped}>{played}</FlipMarks>
          </strong>
          <span className={verdictLabel} style={{ ['--label' as string]: LABELS[review.label].color }}>
            {LABELS[review.label].text}
          </span>
        </div>
        {bookLast?.branch.note && <p className={note()}>{bookLast.branch.note}</p>}
        {bookLast?.branch.kind === 'deviation' && bookLast.branch.punishNote && <p className={note({ tone: 'warn' })}>{bookLast.branch.punishNote}</p>}
        {review.reasons.slice(0, 2).map((r) => (
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
        <div className={verdictHead}>
          <span className={badge} style={{ ['--label' as string]: LABELS.book.color }}>
            {LABELS.book.symbol}
          </span>
          <strong>
            <FlipMarks flipped={flipped}>{played}</FlipMarks>
          </strong>
          <span className={verdictLabel} style={{ ['--label' as string]: LABELS.book.color }}>
            {t('coach.bookMove')}
          </span>
        </div>
        {bookLast.branch.note && <p className={note()}>{bookLast.branch.note}</p>}
      </>
    )
  if (bookLast)
    return (
      <>
        <div className={verdictHead}>
          <span className={badge} style={{ ['--label' as string]: LABELS.mistake.color }}>
            {LABELS.mistake.symbol}
          </span>
          <strong>
            <FlipMarks flipped={flipped}>{played}</FlipMarks>
          </strong>
          <span className={verdictLabel} style={{ ['--label' as string]: LABELS.mistake.color }}>
            {t('coach.knownMistake')}
          </span>
        </div>
        {(bookLast.branch.punishNote ?? bookLast.branch.note) && <p className={note({ tone: 'warn' })}>{bookLast.branch.punishNote ?? bookLast.branch.note}</p>}
      </>
    )
  return <p className={muted}>{ai ? t('coach.checking', { move: played }) : t('coach.isOffTheBookTurn', { move: played })}</p>
}

export function CoachPane({ review, lastMove, prevSfen, bookLast, bookHere, sfen, course, onPlay, canPlay, ai, showBook, you }: CoachPaneProps) {
  const { t } = useTranslation()
  const flipped = useFlipped()
  return (
    <div className="app-coach">
      {lastMove && prevSfen ? (
        <div className="app-verdict">
          <Verdict review={review} lastMove={lastMove} prevSfen={prevSfen} bookLast={bookLast} ai={ai} you={you} />
        </div>
      ) : (
        <p className={muted}>{course ? (course.root.comment ?? course.goalFormation) : t('coach.makeAMoveTheCoach')}</p>
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
              css={{
                '& strong': { display: 'block', fontFamily: 'mincho', fontWeight: 'heavy', fontSize: 'md' },
                '& span': { fontFamily: 'mincho', fontSize: 'sm', color: 'fg.muted' },
              }}
              disabled={!canPlay}
              onClick={() => onPlay(b.usi)}
            >
              <strong>
                <FlipMarks flipped={flipped}>{moveText(sfen, b.usi)}</FlipMarks>
              </strong>
              {b.note && <span>{b.note}</span>}
            </styled.button>
          ))}
        </styled.div>
      )}
    </div>
  )
}
