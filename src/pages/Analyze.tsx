import { useRef, useState } from 'react'
import { Board } from '../components/Board'
import { EvalBar } from '../components/EvalBar'
import { analyze, engineSupported, type Analysis } from '../engine'
import { classify, LABELS, scoreForSide, scoreWinRate, type Label, type MoveReview } from '../analysis'
import { accuracyFromLoss, bookLookup, decodeKifuFile, parseGame, type Game } from '../kifu'
import { applyUsi, colorSide, moveText, positionOf, pvText, type Side } from '../shogi'
import { saveMistakes } from '../mistakes'
import { go } from '../hooks'
import { courseById } from '../model'

type Row = { index: number; sfen: string; after: string; usi: string; mover: Side; review: MoveReview; book: string | null }

function sampleGame() {
  const course = courseById('ibisha-vs-shikenbisha--45hayashikake')
  const moves: string[] = []
  let node = course?.root ?? null
  while (node?.branches.length) {
    const main = node.branches.find((b) => b.kind === 'main') ?? node.branches[0]
    moves.push(main.usi)
    node = main.child
  }
  return `position startpos moves ${moves.join(' ')}`
}

export function Analyze() {
  const [text, setText] = useState('')
  const [game, setGame] = useState<Game | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [movetime, setMovetime] = useState(700)
  const [selected, setSelected] = useState<number | null>(null)
  const [mySide, setMySide] = useState<Side | 'both'>('both')
  const [savedCount, setSavedCount] = useState<number | null>(null)
  const cancelRef = useRef(false)

  const load = (data: string) => {
    const parsed = parseGame(data)
    if (parsed instanceof Error) {
      setError(`Could not read that kifu: ${parsed.message}`)
      return
    }
    setError(null)
    setGame(parsed)
    setRows([])
    setSelected(null)
    setSavedCount(null)
  }

  const onFile = async (file: File) => {
    const data = decodeKifuFile(await file.arrayBuffer())
    setText(data)
    load(data)
  }

  const run = async () => {
    if (!game) return
    cancelRef.current = false
    const positions = [game.startSfen]
    for (const usi of game.moves) {
      const next = applyUsi(positions.at(-1)!, usi)
      if (!next) break
      positions.push(next)
    }
    const analyses: (Analysis | null)[] = []
    setProgress({ done: 0, total: positions.length })
    setRows([])
    let bookAlive = true
    let lastBook: string | null = null
    let previousLoss = 0
    for (let i = 0; i < positions.length; i++) {
      if (cancelRef.current) break
      const terminal = i > 0 && positionOf(positions[i]).checked && i === positions.length - 1
      analyses.push(terminal ? null : await analyze(`position sfen ${positions[i]}`, { multipv: 2, movetime }))
      setProgress({ done: i + 1, total: positions.length })
      if (i === 0) continue
      const before = analyses[i - 1]
      if (!before || before.candidates.length === 0) continue
      const usi = game.moves[i - 1]
      const hits = bookAlive ? bookLookup(positions[i]) : []
      if (hits.length === 0) bookAlive = false
      else lastBook = hits[0].course.title
      const review = classify({ sfen: positions[i - 1], usi, before, after: analyses[i], inBook: hits.length > 0, previousLoss })
      previousLoss = review.loss
      const row: Row = { index: i, sfen: positions[i - 1], after: positions[i], usi, mover: colorSide(positionOf(positions[i - 1]).color), review, book: hits.length ? lastBook : null }
      setRows((r) => [...r, row])
    }
    setProgress(null)
  }

  const counts = (side: Side) => {
    const mine = rows.filter((r) => r.mover === side)
    const tally = mine.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.review.label]: (acc[r.review.label] ?? 0) + 1 }), {})
    const accuracy = mine.length ? mine.reduce((s, r) => s + accuracyFromLoss(r.review.loss * 100), 0) / mine.length : null
    return { tally, accuracy }
  }

  const leftBook = rows.find((r) => !r.book)
  const lastBookRow = [...rows].reverse().find((r) => r.book)
  const current = selected !== null ? rows.find((r) => r.index === selected) : null

  const saveMine = () => {
    const bad: Label[] = ['mistake', 'miss', 'blunder']
    const items = rows
      .filter((r) => bad.includes(r.review.label) && (mySide === 'both' || r.mover === mySide))
      .map((r) => ({
        id: `${r.sfen}|${r.usi}`,
        sfen: r.sfen,
        played: r.usi,
        best: r.review.best.move,
        bestPv: r.review.best.pv,
        label: r.review.label,
        reasons: r.review.reasons,
        game: game?.title ?? 'a game',
        ply: r.index,
      }))
    setSavedCount(saveMistakes(items))
  }

  return (
    <div className="page analyze">
      <div className="crumbs">
        <button className="link" onClick={() => go()}>All openings</button> / Analyze
      </div>
      <h1>Analyze a game</h1>
      {!engineSupported() && <p className="warn">The AI needs a cross-origin isolated page; analysis is unavailable in this window.</p>}
      <div className="import">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste KIF, KI2, CSA, USI (position startpos moves …), SFEN or USEN"
          rows={6}
        />
        <div className="row">
          <button className="primary" onClick={() => load(text)}>Load game</button>
          <label className="file">
            Open file
            <input type="file" accept=".kif,.kifu,.ki2,.ki2u,.csa,.jkf,.txt" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          </label>
          <button className="link" onClick={() => { const sample = sampleGame(); setText(sample); load(sample) }}>Try a sample</button>
        </div>
        {error && <p className="warn">{error}</p>}
      </div>

      {game && (
        <div className="analyze-run">
          <p>
            <strong>{game.title}</strong>, {game.moves.length} moves.
          </p>
          <div className="row">
            <label className="toggle">
              <span>Think time per move</span>
              <select value={movetime} onChange={(e) => setMovetime(Number(e.target.value))}>
                <option value={300}>Fast (0.3s)</option>
                <option value={700}>Normal (0.7s)</option>
                <option value={1500}>Deep (1.5s)</option>
              </select>
            </label>
            {!progress ? (
              <button className="primary" onClick={run} disabled={!engineSupported()}>Analyze all moves</button>
            ) : (
              <button onClick={() => { cancelRef.current = true }}>Stop</button>
            )}
            {progress && <span className="muted">{progress.done} / {progress.total} positions</span>}
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="summary">
            {(['sente', 'gote'] as Side[]).map((side) => {
              const { tally, accuracy } = counts(side)
              return (
                <div key={side} className="summary-side">
                  <h2>{side === 'sente' ? '☗ Sente' : '☖ Gote'}{accuracy !== null && <span className="accuracy"> {accuracy.toFixed(1)}% accuracy</span>}</h2>
                  <ul className="tally">
                    {(Object.keys(LABELS) as Label[]).filter((l) => tally[l]).map((l) => (
                      <li key={l}><span className="mini-stamp" style={{ background: LABELS[l].color }}>{LABELS[l].symbol}</span> {LABELS[l].text} {tally[l]}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
            <div className="summary-book">
              {lastBookRow ? (
                <p>Followed <strong>{lastBookRow.book}</strong> until move {lastBookRow.index}.{leftBook && ` Left the book line at move ${leftBook.index} (${moveText(leftBook.sfen, leftBook.usi)}).`}</p>
              ) : (
                <p className="muted">No collected joseki line matched this game.</p>
              )}
            </div>
          </div>

          <EvalGraph rows={rows} selected={selected} onSelect={setSelected} />

          <div className="row">
            <label className="toggle">
              <span>Which side were you?</span>
              <select value={mySide} onChange={(e) => setMySide(e.target.value as Side | 'both')}>
                <option value="both">Both</option>
                <option value="sente">Sente</option>
                <option value="gote">Gote</option>
              </select>
            </label>
            <button onClick={saveMine}>Save my mistakes as puzzles</button>
            {savedCount !== null && <span className="muted">{savedCount} new puzzle{savedCount === 1 ? '' : 's'} saved. Find them in Review → My game mistakes.</span>}
          </div>

          <div className="analysis-body">
            <ol className="move-list analysis-moves">
              {rows.map((r) => (
                <li key={r.index}>
                  <button className={selected === r.index ? 'current' : ''} onClick={() => setSelected(r.index)}>
                    <span className="ply">{r.index}</span>
                    {moveText(r.sfen, r.usi)}
                    <span className="mini-stamp" style={{ background: LABELS[r.review.label].color }} title={LABELS[r.review.label].text}>{LABELS[r.review.label].symbol}</span>
                  </button>
                </li>
              ))}
            </ol>
            {current && (
              <div className="analysis-detail">
                <div className="board-and-bar">
                  <EvalBar score={scoreForSide(current.review.after, current.mover, 'sente')} />
                  <Board
                    sfen={current.after}
                    flipped={false}
                    lastMove={current.usi}
                    interactive={false}
                    stamp={{ usi: current.usi, label: current.review.label }}
                    arrows={current.review.best.move !== current.usi ? [{ usi: current.review.best.move, color: '#3d8b3d' }] : []}
                  />
                </div>
                <div className="panel">
                  <h2>
                    {current.index}. {moveText(current.sfen, current.usi)}{' '}
                    <span style={{ color: LABELS[current.review.label].color }}>{LABELS[current.review.label].text}</span>
                  </h2>
                  {current.book && <p className="muted">Book: {current.book}</p>}
                  {current.review.reasons.length > 0 && <ul>{current.review.reasons.map((x) => <li key={x}>{x}</li>)}</ul>}
                  {current.review.best.move !== current.usi && <p>Best: {pvText(current.sfen, current.review.best.pv, 8)}</p>}
                  <p className="muted small">Win chance for the mover: {Math.round(scoreWinRate(current.review.before) * 100)}% → {Math.round(scoreWinRate(current.review.after) * 100)}%</p>
                  <button onClick={() => go('play', current.sfen)}>Play on from before this move</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function EvalGraph({ rows, selected, onSelect }: { rows: Row[]; selected: number | null; onSelect: (i: number) => void }) {
  const w = 600
  const h = 120
  const total = Math.max(rows.at(-1)?.index ?? 1, 1)
  const points = rows.map((r) => {
    const sente = scoreForSide(r.review.after, r.mover, 'sente')
    return { x: (r.index / total) * w, y: (1 - scoreWinRate(sente)) * h, r }
  })
  return (
    <svg className="eval-graph" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label="Win chance for sente over the game">
      <rect x="0" y="0" width={w} height={h / 2} className="graph-gote" />
      <rect x="0" y={h / 2} width={w} height={h / 2} className="graph-sente" />
      <polyline points={points.map((p) => `${p.x},${p.y}`).join(' ')} className="graph-line" />
      {points.map((p) => {
        const bad = ['mistake', 'miss', 'blunder'].includes(p.r.review.label)
        return (
          <circle
            key={p.r.index}
            cx={p.x}
            cy={p.y}
            r={selected === p.r.index ? 5 : bad ? 3.5 : 0}
            fill={LABELS[p.r.review.label].color}
            onClick={() => onSelect(p.r.index)}
          />
        )
      })}
      {points.map((p) => (
        <rect key={`hit-${p.r.index}`} x={p.x - w / total / 2} y={0} width={w / total} height={h} fill="transparent" onClick={() => onSelect(p.r.index)} />
      ))}
    </svg>
  )
}
