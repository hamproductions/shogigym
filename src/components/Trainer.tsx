import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { InitialPositionSFEN } from 'tsshogi'
import { Board, type Arrow } from './Board'
import { Flowchart } from './Flowchart'
import { Coach } from './Coach'
import { EvalBar } from './EvalBar'
import { findPath, sideToMove, verdictFor, type Course, type JosekiMove, type JosekiNode, type MoveKind } from '../model'
import { applyUsi, colorSide, moveText, positionOf, pvText, type Side } from '../shogi'
import { LABELS, reviewMove, scoreForSide, scoreWinRate, type MoveReview } from '../analysis'
import { analyze, engineSupported, formatScore, type Score } from '../engine'
import { useAnalysis } from '../hooks'
import { positionKey, record } from '../srs'

export type Ply = {
  sfen: string
  before: string
  usi: string
  mover: Side
  node: JosekiNode | null
  kind: MoveKind | null
  bookMove: JosekiMove | null
  review: MoveReview | 'pending' | null
}

type OpponentMode = 'off' | 'book' | 'ai'

type Props = {
  course?: Course
  startSfen?: string
  startNodeId?: string
  userSide?: Side
  defaultOpponent?: OpponentMode
  defaultQuiz?: boolean
  title?: string
  onPly?: (ply: Ply, index: number) => void
  hideFlowchart?: boolean
}

function pickBranch(node: JosekiNode): JosekiMove {
  const weights = { main: 6, alt: 3, deviation: 2 }
  const total = node.branches.reduce((s, b) => s + weights[b.kind], 0)
  let r = Math.random() * total
  for (const b of node.branches) {
    r -= weights[b.kind]
    if (r <= 0) return b
  }
  return node.branches[0]
}

export function Trainer({ course, startSfen, startNodeId, userSide, defaultOpponent = 'off', defaultQuiz = false, title, onPly, hideFlowchart }: Props) {
  const root = course?.root ?? null
  const initialPath = useMemo(() => (course && startNodeId ? findPath(course.root, startNodeId) ?? [] : []), [course, startNodeId])
  const baseSfen = root?.sfen ?? startSfen ?? InitialPositionSFEN.STANDARD
  const me: Side = userSide ?? course?.userSide ?? 'sente'

  const buildPlies = useCallback(
    (path: JosekiMove[]): Ply[] => {
      const out: Ply[] = []
      let node = root
      for (const move of path) {
        const before = node!.sfen
        out.push({ sfen: move.child!.sfen, before, usi: move.usi, mover: sideToMove(node!), node: move.child, kind: move.kind, bookMove: move, review: null })
        node = move.child
      }
      return out
    },
    [root],
  )

  const [plies, setPlies] = useState<Ply[]>(() => buildPlies(initialPath))
  const [cursor, setCursor] = useState(initialPath.length)
  const [flipped, setFlipped] = useState(me === 'gote')
  const [quiz, setQuiz] = useState(defaultQuiz)
  const [opponent, setOpponent] = useState<OpponentMode>(defaultOpponent)
  const [showAI, setShowAI] = useState(false)
  const [coachOn, setCoachOn] = useState(true)
  const [quizFeedback, setQuizFeedback] = useState<{ correct: boolean; expected: JosekiMove[]; fromSfen: string } | null>(null)
  const [revealedAt, setRevealedAt] = useState<number | null>(null)
  const pliesRef = useRef(plies)
  useEffect(() => {
    pliesRef.current = plies
  }, [plies])

  const sfen = cursor === 0 ? baseSfen : plies[cursor - 1].sfen
  const node: JosekiNode | null = cursor === 0 ? root : plies[cursor - 1].node
  const turn = colorSide(positionOf(sfen).color)
  const lastPly = cursor > 0 ? plies[cursor - 1] : null
  const live = useAnalysis(sfen, showAI && engineSupported())

  const setReview = (index: number, usi: string, review: MoveReview | null) => {
    setPlies((current) => current.map((p, i) => (i === index && p.usi === usi ? { ...p, review } : p)))
  }

  const play = useCallback(
    (usi: string, from: { sfen: string; node: JosekiNode | null; index: number }, auto = false) => {
      const next = applyUsi(from.sfen, usi)
      if (!next) return
      const mover = colorSide(positionOf(from.sfen).color)
      const bookMove = from.node?.branches.find((b) => b.usi === usi) ?? null
      const ply: Ply = {
        sfen: next,
        before: from.sfen,
        usi,
        mover,
        node: bookMove?.child ?? null,
        kind: bookMove?.kind ?? null,
        bookMove,
        review: null,
      }
      const index = from.index
      setPlies((current) => [...current.slice(0, index), ply])
      setCursor(index + 1)
      onPly?.(ply, index)

      const isMine = mover === me
      if (course && isMine && from.node && from.node.branches.length > 0 && !auto) {
        const good = from.node.branches.filter((b) => b.kind !== 'deviation')
        const correct = !!bookMove && bookMove.kind !== 'deviation'
        if (quiz) {
          record(positionKey(from.node.sfen), correct)
          setQuizFeedback({ correct, expected: good, fromSfen: from.sfen })
        }
      } else if (!auto) setQuizFeedback(null)

      const knownGood = !!bookMove && bookMove.kind !== 'deviation'
      if (coachOn && engineSupported() && !knownGood && (isMine || !auto)) {
        const previous = pliesRef.current[index - 1]?.review
        const previousLoss = previous && previous !== 'pending' && previous.usi ? previous.loss : 0
        setPlies((current) => current.map((p, i) => (i === index ? { ...p, review: 'pending' } : p)))
        reviewMove(from.sfen, usi, { inBook: !!bookMove && bookMove.kind !== 'deviation', previousLoss })
          .then((review) => setReview(index, usi, review))
          .catch(() => setReview(index, usi, null))
      }
    },
    [course, me, quiz, coachOn, onPly],
  )

  useEffect(() => {
    if (opponent === 'off' || turn === me || cursor !== plies.length) return
    if (quiz && quizFeedback && !quizFeedback.correct) return
    let cancelled = false
    const timer = setTimeout(async () => {
      if (cancelled) return
      if (node && node.branches.length > 0 && opponent === 'book') {
        play(pickBranch(node).usi, { sfen, node, index: cursor }, true)
        return
      }
      if (!engineSupported()) return
      const result = await analyze(`position sfen ${sfen}`, { multipv: 1, movetime: 500 })
      if (!cancelled && result.bestmove && !['resign', 'win'].includes(result.bestmove)) play(result.bestmove, { sfen, node: null, index: cursor }, true)
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [opponent, turn, me, cursor, plies.length, node, sfen, play, quiz, quizFeedback])

  useEffect(() => {
    if (!coachOn || !engineSupported() || (turn !== me && opponent !== 'off')) return
    const timer = setTimeout(() => analyze(`position sfen ${sfen}`, { multipv: 3, movetime: 300 }).catch(() => undefined), 30)
    return () => clearTimeout(timer)
  }, [coachOn, turn, me, sfen, opponent])

  const onBoardMove = (usi: string) => play(usi, { sfen, node, index: cursor })

  const jump = (nodeId: string) => {
    if (!course) return
    const path = findPath(course.root, nodeId) ?? []
    setPlies(buildPlies(path))
    setCursor(path.length)
    setQuizFeedback(null)
  }

  const back = () => {
    setCursor((c) => Math.max(0, c - 1))
    setQuizFeedback(null)
  }
  const forward = () => setCursor((c) => Math.min(plies.length, c + 1))
  const restart = () => {
    setPlies(buildPlies(initialPath))
    setCursor(initialPath.length)
    setQuizFeedback(null)
  }
  const retry = () => {
    setPlies((current) => current.slice(0, cursor - 1))
    setCursor((c) => c - 1)
    setQuizFeedback(null)
  }

  const playDemo = (usis: string[], fromCursor = cursor) => {
    const start = fromCursor === 0 ? baseSfen : plies[fromCursor - 1].sfen
    let s = start
    const extra: Ply[] = []
    for (const usi of usis) {
      const next = applyUsi(s, usi)
      if (!next) break
      extra.push({ sfen: next, before: s, usi, mover: colorSide(positionOf(s).color), node: null, kind: null, bookMove: null, review: null })
      s = next
    }
    setPlies((current) => [...current.slice(0, fromCursor), ...extra])
    setCursor(fromCursor + extra.length)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select')) return
      if (e.key === 'ArrowLeft') back()
      if (e.key === 'ArrowRight') forward()
      if (e.key === 'f') setFlipped((f) => !f)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const revealed = revealedAt === cursor
  const hideNext = quiz && turn === me && !revealed
  const arrows: Arrow[] = []
  if (showAI && live.analysis) {
    live.analysis.candidates.slice(0, 3).forEach((c, i) => arrows.push({ usi: c.move, color: ['#2e6bd6', '#5b8ee6', '#9db8ec'][i] }))
  }
  if (revealed && node) node.branches.filter((b) => b.kind !== 'deviation').forEach((b) => arrows.push({ usi: b.usi, color: '#3d8b3d' }))
  const lastReview = lastPly?.review && lastPly.review !== 'pending' ? lastPly.review : null
  if (lastReview?.reply && cursor === plies.length && ['inaccuracy', 'mistake', 'miss', 'blunder'].includes(lastReview.label))
    arrows.push({ usi: lastReview.reply.move, color: '#c0392b' })

  const stamp = lastPly
    ? lastReview
      ? { usi: lastPly.usi, label: lastReview.label }
      : lastPly.kind && lastPly.kind !== 'deviation'
        ? { usi: lastPly.usi, label: 'book' as const }
        : null
    : null

  const evalScore: Score | null = live.analysis?.candidates[0]
    ? scoreForSide(live.analysis.candidates[0].score, turn, me)
    : lastReview
      ? scoreForSide(lastReview.after, lastPly!.mover, me)
      : null

  return (
    <div className="trainer">
      <section className="trainer-board">
        {title && <h1 className="trainer-title">{title}</h1>}
        <div className="board-and-bar">
          <EvalBar score={evalScore} />
          <Board sfen={sfen} flipped={flipped} lastMove={lastPly?.usi} arrows={arrows} stamp={stamp} onMove={onBoardMove} />
        </div>
        <div className="controls">
          <div className="nav-buttons">
            <button onClick={restart} title="Back to start">⏮</button>
            <button onClick={back} disabled={cursor === 0} title="Back (←)">◀</button>
            <button onClick={forward} disabled={cursor >= plies.length} title="Forward (→)">▶</button>
            <button onClick={() => setFlipped((f) => !f)} title="Flip board (f)">⇅</button>
          </div>
          <div className="toggles">
            <label className="toggle">
              <span>Opponent</span>
              <select value={opponent} onChange={(e) => setOpponent(e.target.value as OpponentMode)}>
                <option value="off">I move both sides</option>
                {course && <option value="book">Plays book, then AI</option>}
                <option value="ai">AI plays its best</option>
              </select>
            </label>
            {course && (
              <label className="toggle check">
                <input type="checkbox" checked={quiz} onChange={(e) => setQuiz(e.target.checked)} />
                <span>Quiz me (hide answers)</span>
              </label>
            )}
            <label className="toggle check">
              <input type="checkbox" checked={showAI} onChange={(e) => setShowAI(e.target.checked)} />
              <span>Show AI best moves</span>
            </label>
            <label className="toggle check">
              <input type="checkbox" checked={coachOn} onChange={(e) => setCoachOn(e.target.checked)} />
              <span>Rate my moves</span>
            </label>
          </div>
        </div>
        <MoveList plies={plies} cursor={cursor} onSelect={setCursor} />
      </section>

      <aside className="trainer-side">
        {!engineSupported() && <p className="warn">AI is unavailable in this browser window (needs cross-origin isolation). Joseki data still works.</p>}

        {quizFeedback && (
          <div className={`quiz-feedback ${quizFeedback.correct ? 'ok' : 'ng'}`}>
            {quizFeedback.correct ? (
              <p>Correct. That is the book move.</p>
            ) : (
              <>
                <p>Not the book move. Book: {quizFeedback.expected.map((b) => moveText(quizFeedback.fromSfen, b.usi)).join(' or ')}</p>
                <div className="row">
                  <button onClick={retry}>Try again</button>
                  <button onClick={() => setQuizFeedback({ ...quizFeedback, correct: true })}>Keep playing from here</button>
                </div>
              </>
            )}
          </div>
        )}

        <Coach ply={lastPly} course={course} me={me} onDemo={(usis) => playDemo(usis)} onAlternative={(usis) => playDemo(usis, cursor - 1)} />

        {showAI && (
          <div className="panel ai-panel">
            <h2>AI candidates</h2>
            {!live.analysis && <p className="muted">Thinking…</p>}
            {live.analysis?.candidates.map((c) => (
              <button key={c.multipv} className="candidate" onClick={() => onBoardMove(c.move)}>
                <span className="cand-score">{formatScore(scoreForSide(c.score, turn, me))}</span>
                <span className="cand-pv">{pvText(sfen, c.pv, 6)}</span>
                <span className="cand-wr">{Math.round(scoreWinRate(scoreForSide(c.score, turn, me)) * 100)}%</span>
              </button>
            ))}
          </div>
        )}

        {course && (
          <NextSteps
            course={course}
            node={node}
            me={me}
            hidden={hideNext}
            onReveal={() => setRevealedAt(cursor)}
            onPlay={(usi) => onBoardMove(usi)}
            offBook={!node && cursor > 0}
          />
        )}

        {course && node?.comment && <div className="panel note-panel"><p>{node.comment}</p></div>}

        {course && !hideFlowchart && (quiz ? (
          <details className="panel flow-panel">
            <summary>Flowchart (hidden while quizzing)</summary>
            <Flowchart course={course} currentNodeId={node?.id ?? null} onJump={jump} />
          </details>
        ) : (
          <div className="panel flow-panel">
            <h2>Flowchart</h2>
            <Flowchart course={course} currentNodeId={node?.id ?? null} onJump={jump} />
          </div>
        ))}
      </aside>
    </div>
  )
}

function NextSteps({ course, node, me, hidden, onReveal, onPlay, offBook }: { course: Course; node: JosekiNode | null; me: Side; hidden: boolean; onReveal: () => void; onPlay: (usi: string) => void; offBook: boolean }) {
  if (offBook) return <div className="panel"><h2>What next?</h2><p className="muted">You are off the book line. Keep playing freely. The AI rates every move, or jump back in using the flowchart.</p></div>
  if (!node) return null
  if (node.branches.length === 0) return <div className="panel"><h2>End of the book line</h2><p className="muted">Switch Opponent to “AI plays its best” to keep sparring from here.</p></div>
  const mover = sideToMove(node)
  const mine = mover === me
  if (hidden)
    return (
      <div className="panel">
        <h2>Your move</h2>
        <p className="muted">Find the book move on the board.</p>
        <button onClick={onReveal}>Show me</button>
      </div>
    )
  return (
    <div className="panel">
      <h2>{mine ? 'What do I play?' : 'What might they play?'}</h2>
      <ul className="next-list">
        {node.branches.map((b) => {
          const verdict = verdictFor(course, mover, b.kind)
          const reply = b.child?.branches.find((r) => r.kind === 'main')
          return (
            <li key={b.usi} className={`next v-${verdict}`}>
              <button className="next-move" onClick={() => onPlay(b.usi)}>
                {moveText(node.sfen, b.usi)}
              </button>
              <span className="next-tag">
                {verdict === 'good' ? (b.kind === 'main' ? 'book' : 'also fine') : verdict === 'mistake' ? 'mistake' : verdict === 'opponent-mistake' ? 'their mistake' : b.kind === 'main' ? 'most likely' : 'possible'}
              </span>
              {b.aim && mine && <p className="next-aim">Aim: {b.aim}</p>}
              {b.note && <p className="next-note">{b.note}</p>}
              {b.punishNote && <p className="next-punish">{verdict === 'mistake' ? 'How they punish it: ' : 'How you punish it: '}{b.punishNote}</p>}
              {!mine && reply && b.child && (
                <p className="next-reply">
                  → you answer <strong>{moveText(b.child.sfen, reply.usi)}</strong>
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function MoveList({ plies, cursor, onSelect }: { plies: Ply[]; cursor: number; onSelect: (n: number) => void }) {
  if (plies.length === 0) return null
  return (
    <ol className="move-list">
      {plies.map((p, i) => {
        const review = p.review && p.review !== 'pending' ? p.review : null
        const label = review?.label ?? (p.kind && p.kind !== 'deviation' ? 'book' : null)
        return (
          <li key={i}>
            <button className={i + 1 === cursor ? 'current' : ''} onClick={() => onSelect(i + 1)}>
              <span className="ply">{i + 1}</span>
              {moveText(p.before, p.usi)}
              {label && <span className="mini-stamp" style={{ background: LABELS[label].color }} title={LABELS[label].text}>{LABELS[label].symbol}</span>}
              {p.review === 'pending' && <span className="mini-stamp pending">…</span>}
            </button>
          </li>
        )
      })}
    </ol>
  )
}
