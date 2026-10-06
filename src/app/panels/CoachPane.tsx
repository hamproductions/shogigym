import { useTranslation } from 'react-i18next'
import { LABELS, type MoveReview } from '@/utils/analysis'
import type { Course } from '@/utils/model'
import i18n from '@/utils/i18n'
import { moveText } from '@/utils/shogi'
import type { BookHit, BookMove } from '@/utils/book'
import { isWeak } from '@/utils/mistake'

interface CoachPaneProps {
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

function Verdict({
  review,
  lastMove,
  prevSfen,
  bookLast,
  ai,
  you,
}: Pick<CoachPaneProps, 'review' | 'bookLast' | 'ai' | 'you'> & { lastMove: string; prevSfen: string }) {
  const { t } = useTranslation()
  const played = moveText(prevSfen, lastMove)
  if (review)
    return (
      <>
        <div className="app-verdict-head">
          <span className="app-badge" style={{ ['--label' as string]: LABELS[review.label].color }}>
            {LABELS[review.label].symbol}
          </span>
          <strong>
            {you ? t('coach.yourMove') : ''}
            {played}
          </strong>
          <span className="app-verdict-label" style={{ ['--label' as string]: LABELS[review.label].color }}>
            {LABELS[review.label].text}
          </span>
        </div>
        {bookLast?.branch.note && <p className="app-note">{bookLast.branch.note}</p>}
        {bookLast?.branch.kind === 'deviation' && bookLast.branch.punishNote && <p className="app-note warn">{bookLast.branch.punishNote}</p>}
        {review.reasons.slice(0, 2).map((r) => (
          <p key={r} className="app-reason">
            {r}
          </p>
        ))}
        {isWeak(review.label) && review.best.move !== lastMove && !review.reasons.some((r) => r.startsWith(prefixOf('moveFacts.bestWins'))) && (
          <p className="app-reason">
            {t('coach.betterWas')}
            <strong>{moveText(prevSfen, review.best.move)}</strong>
            {review.bestReasons[0] && !review.bestReasons[0].startsWith(prefixOf('moveFacts.engineLine'))
              ? `: ${review.bestReasons[0]}`
              : t('coach.betterWasEnd')}
          </p>
        )}
      </>
    )
  if (bookLast && bookLast.branch.kind !== 'deviation')
    return (
      <>
        <div className="app-verdict-head">
          <span className="app-badge" style={{ ['--label' as string]: LABELS.book.color }}>
            {LABELS.book.symbol}
          </span>
          <strong>{played}</strong>
          <span className="app-verdict-label" style={{ ['--label' as string]: LABELS.book.color }}>
            {t('coach.bookMove')}
          </span>
        </div>
        {bookLast.branch.note && <p className="app-note">{bookLast.branch.note}</p>}
      </>
    )
  if (bookLast)
    return (
      <>
        <div className="app-verdict-head">
          <span className="app-badge" style={{ ['--label' as string]: LABELS.mistake.color }}>
            {LABELS.mistake.symbol}
          </span>
          <strong>{played}</strong>
          <span className="app-verdict-label" style={{ ['--label' as string]: LABELS.mistake.color }}>
            {t('coach.knownMistake')}
          </span>
        </div>
        {(bookLast.branch.punishNote ?? bookLast.branch.note) && <p className="app-note warn">{bookLast.branch.punishNote ?? bookLast.branch.note}</p>}
      </>
    )
  return <p className="app-muted">{ai ? t('coach.checking', { move: played }) : t('coach.isOffTheBookTurn', { move: played })}</p>
}

export function CoachPane({ review, lastMove, prevSfen, bookLast, bookHere, sfen, course, onPlay, canPlay, ai, showBook, you }: CoachPaneProps) {
  const { t } = useTranslation()
  return (
    <div className="app-coach">
      {lastMove && prevSfen ? (
        <div className="app-verdict">
          <Verdict review={review} lastMove={lastMove} prevSfen={prevSfen} bookLast={bookLast} ai={ai} you={you} />
        </div>
      ) : (
        <p className="app-muted">{course ? (course.root.comment ?? course.goalFormation) : t('coach.makeAMoveTheCoach')}</p>
      )}
      {showBook && bookHere.length > 0 && (
        <div className="app-book">
          <h3>{t('coach.bookMovesFromTheLessons')}</h3>
          {bookHere.map((b) => (
            <button key={b.usi} className="app-book-move" disabled={!canPlay} onClick={() => onPlay(b.usi)}>
              <strong>{moveText(sfen, b.usi)}</strong>
              {b.note && <span>{b.note}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
