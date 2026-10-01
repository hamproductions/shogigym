import { useEffect, useRef } from 'react'
import { verdictFor, sideToMove, type Course, type JosekiMove, type JosekiNode } from '../model'
import { moveText } from '../shogi'

type Props = {
  course: Course
  currentNodeId: string | null
  onJump: (nodeId: string) => void
}

const FORK_LABEL = {
  good: 'Your move',
  book: 'Opponent plays',
  mistake: 'Your mistake',
  'opponent-mistake': 'Opponent slips: punish it',
} as const

function collect(parent: JosekiNode, start: JosekiMove, ply: number) {
  const run: { move: JosekiMove; from: JosekiNode; ply: number }[] = [{ move: start, from: parent, ply }]
  let node = start.child
  let n = ply
  while (node && node.branches.length === 1) {
    n++
    run.push({ move: node.branches[0], from: node, ply: n })
    node = node.branches[0].child
  }
  return { run, end: node, endPly: n }
}

function Branch({ course, parent, move, ply, currentNodeId, onJump }: { course: Course; parent: JosekiNode; move: JosekiMove; ply: number; currentNodeId: string | null; onJump: (id: string) => void }) {
  const { run, end, endPly } = collect(parent, move, ply)
  return (
    <div className="flow-segment">
      <div className="flow-moves">
        {run.map(({ move: m, from, ply: p }) => {
          const mover = sideToMove(from)
          const verdict = verdictFor(course, mover, m.kind)
          const id = m.child?.id ?? ''
          return (
            <button
              key={id || m.usi + p}
              data-node={id}
              className={`flow-move v-${verdict} ${mover === course.userSide ? 'mine' : 'theirs'} ${id === currentNodeId ? 'current' : ''}`}
              onClick={() => id && onJump(id)}
              title={m.note ?? ''}
            >
              <span className="ply">{p}</span>
              {moveText(from.sfen, m.usi)}
              {(m.note || m.punishNote) && <span className="has-note" aria-label="has explanation" />}
            </button>
          )
        })}
      </div>
      {end && end.branches.length > 1 && <Fork course={course} node={end} ply={endPly + 1} currentNodeId={currentNodeId} onJump={onJump} />}
      {end && end.branches.length === 0 && end.comment && <p className="flow-end">{end.comment}</p>}
    </div>
  )
}

function Fork({ course, node, ply, currentNodeId, onJump }: { course: Course; node: JosekiNode; ply: number; currentNodeId: string | null; onJump: (id: string) => void }) {
  const mover = sideToMove(node)
  const ordered = [...node.branches].sort((a, b) => ['main', 'alt', 'deviation'].indexOf(a.kind) - ['main', 'alt', 'deviation'].indexOf(b.kind))
  return (
    <div className="flow-fork">
      {ordered.map((move) => {
        const verdict = verdictFor(course, mover, move.kind)
        const label = move.kind === 'alt' && verdict === 'good' ? 'Also playable' : move.kind === 'alt' ? 'Opponent may instead play' : FORK_LABEL[verdict]
        return (
          <div key={move.usi} className={`flow-branch v-${verdict}`}>
            <div className="flow-branch-label">
              {label}: <strong>{moveText(node.sfen, move.usi)}</strong>
            </div>
            <Branch course={course} parent={node} move={move} ply={ply} currentNodeId={currentNodeId} onJump={onJump} />
          </div>
        )
      })}
    </div>
  )
}

export function Flowchart({ course, currentNodeId, onJump }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const box = ref.current
    const el = box?.querySelector<HTMLElement>(`[data-node="${currentNodeId}"]`)
    if (!box || !el) return
    const top = el.offsetTop
    if (top < box.scrollTop || top > box.scrollTop + box.clientHeight - el.offsetHeight) box.scrollTo({ top: top - box.clientHeight / 3, behavior: 'smooth' })
  }, [currentNodeId])
  const root = course.root
  return (
    <div className="flowchart" ref={ref}>
      <button className={`flow-start ${currentNodeId === root.id ? 'current' : ''}`} onClick={() => onJump(root.id)}>
        Start position
      </button>
      {root.branches.length === 1 ? (
        <Branch course={course} parent={root} move={root.branches[0]} ply={1} currentNodeId={currentNodeId} onJump={onJump} />
      ) : (
        <Fork course={course} node={root} ply={1} currentNodeId={currentNodeId} onJump={onJump} />
      )}
    </div>
  )
}
