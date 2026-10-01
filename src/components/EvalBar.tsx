import { scoreWinRate } from '../analysis'
import { formatScore, type Score } from '../engine'

export function EvalBar({ score }: { score: Score | null }) {
  const rate = score ? scoreWinRate(score) : 0.5
  return (
    <div className="eval-bar" title={score ? `${formatScore(score)} (you)` : 'No evaluation yet'} aria-label="Evaluation for you">
      <div className="eval-fill" style={{ height: `${rate * 100}%` }} />
      <span className="eval-text">{score ? formatScore(score) : '–'}</span>
    </div>
  )
}
