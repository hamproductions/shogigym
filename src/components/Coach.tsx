import { LABELS, scoreForSide } from '../analysis'
import { formatScore } from '../engine'
import type { Course } from '../model'
import { moveText, pvText, type Side } from '../shogi'
import type { Ply } from './Trainer'

type Props = {
  ply: Ply | null
  course?: Course
  me: Side
  onDemo: (usis: string[]) => void
  onAlternative: (usis: string[]) => void
}

export function Coach({ ply, course, me, onDemo, onAlternative }: Props) {
  if (!ply) {
    return (
      <div className="panel coach">
        <h2>Coach</h2>
        <p className="muted">Move any piece. Every move gets checked against the book line and rated by the AI, with the reason why.</p>
        {course?.notesFromOpponentView && <p className="hint">This line is written from the Static Rook side. In its notes, 相手 means you, the Shiken-bisha player.</p>}
      </div>
    )
  }
  const review = ply.review && ply.review !== 'pending' ? ply.review : null
  const book = ply.bookMove
  const whose = ply.mover === me ? 'Your move' : 'Their move'
  const label = review?.label ?? (book && book.kind !== 'deviation' ? 'book' : null)

  return (
    <div className="panel coach">
      <div className="coach-head">
        {label && (
          <span className="coach-stamp" style={{ background: LABELS[label].color }}>
            {LABELS[label].symbol}
          </span>
        )}
        <div>
          <h2>
            {whose}: {moveText(ply.before, ply.usi)}
            {label && <span className="coach-label" style={{ color: LABELS[label].color }}> {LABELS[label].text}</span>}
          </h2>
          {review && (
            <p className="muted small">
              Eval for you: {formatScore(scoreForSide(review.before, ply.mover, me))} → {formatScore(scoreForSide(review.after, ply.mover, me))}
              {review.loss > 0.005 && ` (lost ${Math.round(review.loss * 100)}% win chance)`}
            </p>
          )}
          {ply.review === 'pending' && <p className="muted small">AI is checking this move…</p>}
        </div>
      </div>

      {book?.kind === 'deviation' && (
        <div className={ply.mover === me ? 'callout bad' : 'callout good'}>
          <strong>{ply.mover === me ? 'Known failure pattern.' : 'Known opponent mistake.'}</strong>
          {book.note && <p>{book.note}</p>}
          {book.punishNote && <p>{ply.mover === me ? 'How it gets punished: ' : 'How to punish it: '}{book.punishNote}</p>}
        </div>
      )}
      {book && book.kind !== 'deviation' && (book.note || book.aim) && (
        <div className="callout">
          {book.aim && <p><strong>Aim:</strong> {book.aim}</p>}
          {book.note && <p>{book.note}</p>}
        </div>
      )}
      {book?.demos?.length ? (
        <div className="demos">
          {book.demos.map((d) => (
            <button key={d.title} onClick={() => onDemo(d.usi)} title={d.text}>
              ▶ {d.title}
            </button>
          ))}
        </div>
      ) : null}

      {review && review.reasons.length > 0 && (
        <div className="why">
          <h3>{['inaccuracy', 'mistake', 'miss', 'blunder'].includes(review.label) ? 'Why it is worse' : 'What it does'}</h3>
          <ul>{review.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
      )}
      {review && review.bestReasons.length > 0 && review.label !== 'book' && (
        <div className="why best">
          <h3>{['inaccuracy', 'mistake', 'miss', 'blunder'].includes(review.label) ? 'Better' : 'AI’s top choice'}: {moveText(ply.before, review.best.move)}</h3>
          <ul>{review.bestReasons.map((r) => <li key={r}>{r}</li>)}</ul>
          <button className="link" onClick={() => onAlternative(review.best.pv)}>Show the AI line on the board</button>
        </div>
      )}
      {review?.reply && ['inaccuracy', 'mistake', 'miss', 'blunder'].includes(review.label) && (
        <p className="muted small">Their best answer: {pvText(ply.sfen, review.reply.pv, 6)}</p>
      )}
    </div>
  )
}
