import { useEffect, useState } from 'react'
import { Board } from '../components/Board'
import problemsData from '../data/tsume.json'
import { analyze } from '../engine'
import { engineSupported } from '../engine'
import { applyUsi, colorSide, hasLegalMove, moveText, positionOf, pvText } from '../shogi'
import { go } from '../hooks'

type Problem = { id: string; mate: number; sfen: string; pv: string[] }
const PROBLEMS = problemsData as Problem[]
const STATS_KEY = 'joseki-practice:tsume:v1'

type Stats = { solved: string[]; failed: string[] }

function loadStats(): Stats {
  try {
    return { solved: [], failed: [], ...JSON.parse(localStorage.getItem(STATS_KEY) ?? '{}') }
  } catch {
    return { solved: [], failed: [] }
  }
}

function saveStats(stats: Stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch (error) {
    console.warn('tsume stats not persisted', error)
  }
}

type Status = { kind: 'playing' } | { kind: 'checking' } | { kind: 'solved' } | { kind: 'wrong'; reason: string } | { kind: 'shown' }

function pickProblem(length: number | 'all', stats: Stats, exclude?: string): Problem {
  const pool = PROBLEMS.filter((p) => (length === 'all' || p.mate === length) && p.id !== exclude)
  const unsolved = pool.filter((p) => !stats.solved.includes(p.id))
  const from = unsolved.length ? unsolved : pool
  return from[Math.floor(Math.random() * from.length)]
}

export function Tsume() {
  const [length, setLength] = useState<number | 'all'>(3)
  const [stats, setStats] = useState(loadStats)
  const [problem, setProblem] = useState(() => pickProblem(3, loadStats()))
  const [line, setLine] = useState<string[]>([])
  const [onBook, setOnBook] = useState(true)
  const [status, setStatus] = useState<Status>({ kind: 'playing' })
  const [hint, setHint] = useState(false)

  const sfen = line.reduce((s, usi) => applyUsi(s, usi) ?? s, problem.sfen)
  const attacker = colorSide(positionOf(problem.sfen).color)
  const toMove = colorSide(positionOf(sfen).color)
  const attackerMovesLeft = Math.ceil((problem.mate - line.length) / 2)

  const mark = (key: 'solved' | 'failed') => {
    const next = { ...stats, [key]: [...new Set([...stats[key], problem.id])] }
    setStats(next)
    saveStats(next)
  }

  const newProblem = (len = length) => {
    setProblem(pickProblem(len, stats, problem.id))
    setLine([])
    setOnBook(true)
    setStatus({ kind: 'playing' })
    setHint(false)
  }

  useEffect(() => {
    if (status.kind !== 'playing' || toMove === attacker || line.length === 0) return
    const timer = setTimeout(async () => {
      if (onBook && problem.pv[line.length]) return setLine((l) => [...l, problem.pv[l.length]])
      const result = await analyze(`position sfen ${sfen}`, { multipv: 1, movetime: 600 })
      if (result.bestmove && !['resign', 'win'].includes(result.bestmove)) setLine((l) => [...l, result.bestmove])
    }, 450)
    return () => clearTimeout(timer)
  }, [status.kind, toMove, attacker, line.length, onBook, problem.pv, sfen])

  const attempt = async (usi: string) => {
    if (status.kind !== 'playing' || toMove !== attacker) return
    const next = applyUsi(sfen, usi)
    if (!next) return
    const after = positionOf(next)
    if (!after.checked) {
      setLine((l) => [...l, usi])
      setStatus({ kind: 'wrong', reason: 'In tsume every attacking move must give check. This move does not.' })
      mark('failed')
      return
    }
    if (!hasLegalMove(after)) {
      setLine((l) => [...l, usi])
      setStatus({ kind: 'solved' })
      mark('solved')
      return
    }
    if (onBook && usi === problem.pv[line.length]) return setLine((l) => [...l, usi])
    if (!engineSupported()) {
      setLine((l) => [...l, usi])
      setStatus({ kind: 'wrong', reason: `The stored solution plays ${moveText(sfen, problem.pv[line.length])}.` })
      mark('failed')
      return
    }
    setStatus({ kind: 'checking' })
    const result = await analyze(`position sfen ${next}`, { multipv: 1, movetime: 800 })
    const score = result.candidates[0]?.score
    const pliesToMate = score && 'mate' in score && score.mate < 0 ? -score.mate : null
    setLine((l) => [...l, usi])
    if (pliesToMate !== null && Math.ceil(pliesToMate / 2) <= attackerMovesLeft - 1) {
      setOnBook(false)
      setStatus({ kind: 'playing' })
    } else {
      setStatus({ kind: 'wrong', reason: 'This check lets the king escape: there is no forced mate after it in the moves left.' })
      mark('failed')
    }
  }

  const retry = () => {
    setLine([])
    setOnBook(true)
    setStatus({ kind: 'playing' })
  }

  const showSolution = () => {
    setLine(problem.pv)
    setStatus({ kind: 'shown' })
    mark('failed')
  }

  const pool = PROBLEMS.filter((p) => length === 'all' || p.mate === length)
  const solvedHere = pool.filter((p) => stats.solved.includes(p.id)).length

  return (
    <div className="page tsume">
      <div className="crumbs">
        <button className="link" onClick={() => go()}>All openings</button> / Tsume
      </div>
      <div className="puzzle">
        <div className="puzzle-board">
          <Board
            sfen={sfen}
            flipped={attacker === 'gote'}
            lastMove={line.at(-1)}
            onMove={attempt}
            interactive={status.kind === 'playing' && toMove === attacker}
            arrows={hint && line.length === 0 ? [{ usi: problem.pv[0], color: '#d4a017' }] : []}
          />
        </div>
        <div className="puzzle-side panel">
          <h1>{problem.mate}手詰</h1>
          <p className="muted">
            {attacker === 'sente' ? '☗ Sente' : '☖ Gote'} to move and mate in {problem.mate}. Every attacking move must be a check; the defender always plays the longest resistance.
          </p>
          <div className="segmented">
            {([3, 5, 7, 'all'] as const).map((n) => (
              <button key={n} className={length === n ? 'on' : ''} onClick={() => { setLength(n); newProblem(n) }}>
                {n === 'all' ? 'Mixed' : `${n}手`}
              </button>
            ))}
          </div>
          {status.kind === 'checking' && <p className="muted">AI is checking your move…</p>}
          {status.kind === 'solved' && <div className="callout good"><strong>Mate. Solved.</strong></div>}
          {status.kind === 'wrong' && <div className="callout bad"><strong>Not mate.</strong> {status.reason}</div>}
          {(status.kind === 'shown' || status.kind === 'wrong' || status.kind === 'solved') && (
            <p>Solution: {pvText(problem.sfen, problem.pv, problem.mate)}</p>
          )}
          {line.length > 0 && status.kind === 'playing' && <p className="muted small">Played: {pvText(problem.sfen, line, 12)}</p>}
          <div className="row">
            {status.kind === 'playing' && !hint && line.length === 0 && <button onClick={() => setHint(true)}>Hint</button>}
            {status.kind === 'playing' && <button onClick={showSolution}>Show solution</button>}
            {(status.kind === 'wrong' || status.kind === 'shown') && <button onClick={retry}>Try again</button>}
            <button className="primary" onClick={() => newProblem()}>Next problem</button>
          </div>
          <p className="muted small">
            Solved {solvedHere} of {pool.length} in this set. Problems: YaneuraOu mate-problem set (author released them without copyright claim), each solution re-checked here as a strict check-only mate.
          </p>
        </div>
      </div>
    </div>
  )
}
