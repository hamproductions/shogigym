import { useMemo, useState } from 'react'
import { Board } from './Board'
import { loadMistakes, removeMistake, type Mistake } from '../mistakes'
import { cardKey, getCard, record } from '../srs'
import { colorSide, moveText, positionOf, pvText } from '../shogi'
import { reviewMove, LABELS } from '../analysis'
import { engineSupported } from '../engine'

type Result = { correct: boolean; usi: string; note: string } | null

export function MistakePuzzle() {
  const [items, setItems] = useState(loadMistakes)
  const ordered = useMemo(() => {
    const due = (m: Mistake) => getCard(cardKey('mistake', m.id))?.due ?? 0
    return [...items].sort((a, b) => due(a) - due(b))
  }, [items])
  const [index, setIndex] = useState(0)
  const [result, setResult] = useState<Result>(null)
  const [checking, setChecking] = useState(false)

  if (ordered.length === 0)
    return (
      <div className="empty">
        <p>No saved mistakes yet. Analyze one of your games and press “Save my mistakes as puzzles”. Each mistake becomes a find-the-better-move puzzle.</p>
      </div>
    )

  const puzzle: Mistake = ordered[index % ordered.length]
  const me = colorSide(positionOf(puzzle.sfen).color)

  const attempt = async (usi: string) => {
    if (result) return
    if (usi === puzzle.best) {
      record(cardKey('mistake', puzzle.id), true)
      return setResult({ correct: true, usi, note: 'That is the AI’s top move.' })
    }
    if (!engineSupported()) {
      record(cardKey('mistake', puzzle.id), false)
      return setResult({ correct: false, usi, note: 'Not the stored answer.' })
    }
    setChecking(true)
    const review = await reviewMove(puzzle.sfen, usi, { movetime: 1000 })
    setChecking(false)
    const correct = review.loss <= 0.03
    record(cardKey('mistake', puzzle.id), correct)
    setResult({ correct, usi, note: `${LABELS[review.label].text}. ${correct ? 'Close enough to the best move.' : review.reasons.join(' ')}` })
  }

  const next = () => {
    setResult(null)
    setIndex((i) => i + 1)
  }

  return (
    <div className="puzzle">
      <div className="puzzle-board">
        <Board sfen={puzzle.sfen} flipped={me === 'gote'} onMove={attempt} interactive={!result && !checking} arrows={result ? [{ usi: puzzle.best, color: '#3d8b3d' }] : []} />
      </div>
      <div className="puzzle-side panel">
        <h2>Find a better move</h2>
        <p className="muted">
          From {puzzle.game}, move {puzzle.ply}. You played {moveText(puzzle.sfen, puzzle.played)} ({LABELS[puzzle.label].text}). {me === 'sente' ? '☗' : '☖'} to move.
        </p>
        {checking && <p className="muted">AI is checking…</p>}
        {result && (
          <div className={`callout ${result.correct ? 'good' : 'bad'}`}>
            <p><strong>{result.correct ? 'Solved.' : 'Not quite.'}</strong> {result.note}</p>
            <p>Best: {pvText(puzzle.sfen, puzzle.bestPv, 7)}</p>
            {puzzle.reasons.length > 0 && <ul>{puzzle.reasons.map((r) => <li key={r}>{r}</li>)}</ul>}
          </div>
        )}
        <div className="row">
          {!result && <button onClick={() => { record(cardKey('mistake', puzzle.id), false); setResult({ correct: false, usi: '', note: 'Answer shown.' }) }}>Show answer</button>}
          <button className="primary" onClick={next}>Next puzzle</button>
          <button className="link" onClick={() => { removeMistake(puzzle.id); setItems(loadMistakes()); setResult(null) }}>Delete this puzzle</button>
        </div>
        <p className="muted small">{index % ordered.length + 1} of {ordered.length}</p>
      </div>
    </div>
  )
}
