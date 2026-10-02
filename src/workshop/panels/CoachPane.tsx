import { useTranslation } from 'react-i18next'
import { LABELS, type MoveReview } from '../../analysis'
import type { Course } from '../../model'
import i18n from '../../i18n'
import { moveText } from '../../shogi'
import type { BookHit, BookMove } from '../lib/book'
import { isWeak } from '../lib/mistake'

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

function Verdict({ review, lastMove, prevSfen, bookLast, ai, you }: Pick<CoachPaneProps, 'review' | 'bookLast' | 'ai' | 'you'> & { lastMove: string; prevSfen: string }) {
  const { t } = useTranslation()
  const played = moveText(prevSfen, lastMove)
  if (review)
    return (
      <>
        <div className="ws-verdict-head">
          <span className="ws-badge" style={{ ['--label' as string]: LABELS[review.label].color }}>
            {LABELS[review.label].symbol}
          </span>
          <strong>
            {you ? t('coach.yourMove') : ''}
            {played}
          </strong>
          <span className="ws-verdict-label" style={{ ['--label' as string]: LABELS[review.label].color }}>{LABELS[review.label].text}</span>
        </div>
        {bookLast?.branch.note && <p className="ws-note">{bookLast.branch.note}</p>}
        {bookLast?.branch.kind === 'deviation' && bookLast.branch.punishNote && <p className="ws-note warn">{bookLast.branch.punishNote}</p>}
        {review.reasons.slice(0, 2).map((r) => (
          <p key={r} className="ws-reason">
            {r}
          </p>
        ))}
        {isWeak(review.label) && review.best.move !== lastMove && !review.reasons.some((r) => r.startsWith(prefixOf('moveFacts.bestWins'))) && (
          <p className="ws-reason">
            {t('coach.betterWas')}<strong>{moveText(prevSfen, review.best.move)}</strong>
            {review.bestReasons[0] && !review.bestReasons[0].startsWith(prefixOf('moveFacts.engineLine')) ? `: ${review.bestReasons[0]}` : t('coach.betterWasEnd')}
          </p>
        )}
      </>
    )
  if (bookLast && bookLast.branch.kind !== 'deviation')
    return (
      <>
        <div className="ws-verdict-head">
          <span className="ws-badge" style={{ ['--label' as string]: LABELS.book.color }}>
            {LABELS.book.symbol}
          </span>
          <strong>{played}</strong>
          <span className="ws-verdict-label" style={{ ['--label' as string]: LABELS.book.color }}>{t('coach.bookMove')}</span>
        </div>
        {bookLast.branch.note && <p className="ws-note">{bookLast.branch.note}</p>}
      </>
    )
  if (bookLast)
    return (
      <>
        <div className="ws-verdict-head">
          <span className="ws-badge" style={{ ['--label' as string]: LABELS.mistake.color }}>
            {LABELS.mistake.symbol}
          </span>
          <strong>{played}</strong>
          <span className="ws-verdict-label" style={{ ['--label' as string]: LABELS.mistake.color }}>{t('coach.knownMistake')}</span>
        </div>
        {(bookLast.branch.punishNote ?? bookLast.branch.note) && <p className="ws-note warn">{bookLast.branch.punishNote ?? bookLast.branch.note}</p>}
      </>
    )
  return <p className="ws-muted">{ai ? t('coach.checking', { move: played }) : t('coach.isOffTheBookTurn', { move: played })}</p>
}

export function CoachPane({ review, lastMove, prevSfen, bookLast, bookHere, sfen, course, onPlay, canPlay, ai, showBook, you }: CoachPaneProps) {
  const { t } = useTranslation()
  return (
    <div className="ws-coach">
      {lastMove && prevSfen ? (
        <div className="ws-verdict">
          <Verdict review={review} lastMove={lastMove} prevSfen={prevSfen} bookLast={bookLast} ai={ai} you={you} />
        </div>
      ) : (
        <p className="ws-muted">{course ? course.root.comment ?? course.goalFormation : t('coach.makeAMoveTheCoach')}</p>
      )}
      {showBook && bookHere.length > 0 && (
        <div className="ws-book">
          <h3>{t('coach.bookMovesFromTheLessons')}</h3>
          {bookHere.map((b) => (
            <button key={b.usi} className="ws-book-move" disabled={!canPlay} onClick={() => onPlay(b.usi)}>
              <strong>{moveText(sfen, b.usi)}</strong>
              {b.note && <span>{b.note}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
