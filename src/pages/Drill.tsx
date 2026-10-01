import { useMemo, useState } from 'react'
import { Trainer } from '../components/Trainer'
import { COURSES, sideToMove, walkNodes, type Course, type JosekiNode } from '../model'
import { getCard, isDifficult, LADDER, positionKey } from '../srs'
import { useCards, go } from '../hooks'
import { loadMistakes } from '../mistakes'
import { MistakePuzzle } from '../components/MistakePuzzle'

type Item = { course: Course; node: JosekiNode; key: string; depth: number; courseIds: string[] }

function trainable(): Item[] {
  const items = new Map<string, Item>()
  for (const course of COURSES) {
    walkNodes(course.root, (node, path) => {
      if (sideToMove(node) !== course.userSide) return
      if (!node.branches.some((b) => b.kind !== 'deviation')) return
      const key = positionKey(node.sfen)
      const existing = items.get(key)
      if (existing) existing.courseIds.push(course.id)
      else items.set(key, { course, node, key, depth: path.length, courseIds: [course.id] })
    })
  }
  return [...items.values()]
}

const NEW_PER_SESSION = 10

export function Drill() {
  const cards = useCards()
  const all = useMemo(trainable, [])
  const [scope, setScope] = useState<string>('all')
  const [mode, setMode] = useState<'due' | 'new' | 'difficult' | 'mistakes'>('due')
  const [index, setIndex] = useState(0)
  const [seed] = useState(() => Math.random())
  const [session, setSession] = useState<{ mode: string; scope: string; items: Item[] } | null>(null)

  const now = Date.now()
  const inScope = scope === 'all' ? all : all.filter((i) => i.courseIds.includes(scope)).map((i) => (i.course.id === scope ? i : { ...i, course: COURSES.find((c) => c.id === scope)!, node: findNode(scope, i.key) ?? i.node }))
  const due = inScope.filter((i) => {
    const c = getCard(i.key)
    return c && c.due <= now
  })
  const fresh = inScope.filter((i) => !getCard(i.key)).sort((a, b) => a.course.id.localeCompare(b.course.id) || a.depth - b.depth)
  const difficult = inScope.filter((i) => {
    const c = getCard(i.key)
    return c && isDifficult(c)
  })
  const mistakes = loadMistakes()
  const shuffle = (xs: Item[]) => [...xs].sort((a, b) => hash(a.key + seed) - hash(b.key + seed))
  const live: Item[] = mode === 'due' ? shuffle(due) : mode === 'new' ? fresh.slice(0, NEW_PER_SESSION) : mode === 'difficult' ? shuffle(difficult) : []
  const sessionKey = `${mode}|${scope}`
  if (!session || session.mode !== sessionKey) setSession({ mode: sessionKey, scope, items: live })
  const queue = session?.mode === sessionKey ? session.items : live
  const current = index < queue.length ? queue[index] : undefined
  const finished = queue.length > 0 && index >= queue.length
  const restartSession = () => {
    setSession({ mode: sessionKey, scope, items: live })
    setIndex(0)
  }
  const learned = all.filter((i) => getCard(i.key)).length

  return (
    <div className="page drill">
      <div className="crumbs">
        <button className="link" onClick={() => go()}>All openings</button> / Review
      </div>
      <div className="drill-head">
        <h1>Review positions</h1>
        <p className="muted">
          Spaced repetition per position: right answers come back after 4 hours, then 1 day, 3 days, 1 week, 2 weeks, 1, 3 and 6 months. A wrong answer starts that position over. {learned} of {all.length} positions started, {cards.length} cards total.
        </p>
        <div className="drill-controls">
          <div className="segmented">
            <button className={mode === 'due' ? 'on' : ''} onClick={() => { setMode('due'); setIndex(0) }}>Due ({due.length})</button>
            <button className={mode === 'new' ? 'on' : ''} onClick={() => { setMode('new'); setIndex(0) }}>Learn new ({Math.min(fresh.length, NEW_PER_SESSION)})</button>
            <button className={mode === 'difficult' ? 'on' : ''} onClick={() => { setMode('difficult'); setIndex(0) }}>Difficult ({difficult.length})</button>
            <button className={mode === 'mistakes' ? 'on' : ''} onClick={() => { setMode('mistakes'); setIndex(0) }}>My game mistakes ({mistakes.length})</button>
          </div>
          {mode !== 'mistakes' && (
            <select value={scope} onChange={(e) => { setScope(e.target.value); setIndex(0) }}>
              <option value="all">All lines, mixed</option>
              {COURSES.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          )}
        </div>
      </div>

      {mode === 'mistakes' ? (
        <MistakePuzzle />
      ) : current ? (
        <>
          <p className="drill-progress">
            Card {index + 1} of {queue.length}: {current.course.title}
            {getCard(current.key) && ` (level ${getCard(current.key)!.level} of ${LADDER.length})`}
          </p>
          <Trainer
            key={`${current.key}-${index}`}
            course={current.course}
            startNodeId={current.node.id === current.course.root.id ? undefined : current.node.id}
            defaultQuiz
            defaultOpponent="book"
            hideFlowchart
          />
          <div className="drill-next">
            <button className="primary" onClick={() => setIndex((i) => i + 1)}>Next position</button>
          </div>
        </>
      ) : finished ? (
        <div className="empty">
          <p>Session done: {queue.length} positions reviewed.</p>
          <button className="primary" onClick={restartSession}>Start another round</button>
        </div>
      ) : (
        <div className="empty">
          {live.length > 0 && <button className="primary" onClick={restartSession}>Start ({live.length})</button>}
          {mode === 'due' && <p>Nothing is due. Start new positions with “Learn new”, or open any line and turn on “Quiz me”.</p>}
          {mode === 'new' && <p>Every position in this scope has been started. Come back when reviews are due.</p>}
          {mode === 'difficult' && <p>No difficult positions. A position lands here after 3 or more misses while still early in the schedule.</p>}
        </div>
      )}
      <p className="muted small">{cards.length > 0 && 'Progress is saved in this browser.'}</p>
    </div>
  )
}

function findNode(courseId: string, key: string): JosekiNode | null {
  const course = COURSES.find((c) => c.id === courseId)
  let found: JosekiNode | null = null
  if (course) walkNodes(course.root, (node) => { if (!found && positionKey(node.sfen) === key) found = node })
  return found
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}
