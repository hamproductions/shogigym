import { useState } from 'react'
import { Board } from '../components/Board'
import { COURSES, SETUPS, sideToMove, walkNodes, type Course, type JosekiMove, type JosekiNode } from '../model'
import { go } from '../hooks'
import { moveText } from '../shogi'

type Pattern = { course: Course; node: JosekiNode; move: JosekiMove; mine: boolean; ply: number }

function collect(): Pattern[] {
  const out: Pattern[] = []
  for (const course of COURSES) {
    walkNodes(course.root, (node, path) => {
      for (const move of node.branches) {
        if (move.kind !== 'deviation') continue
        out.push({ course, node, move, mine: sideToMove(node) === course.userSide, ply: path.length + 1 })
      }
    })
  }
  return out
}

const PATTERNS = collect()

export function Patterns() {
  const [tab, setTab] = useState<'fail' | 'win'>('fail')
  const [open, setOpen] = useState<string | null>(null)
  const list = PATTERNS.filter((p) => (tab === 'fail' ? p.mine : !p.mine))
  return (
    <div className="page patterns">
      <div className="crumbs">
        <button className="link" onClick={() => go()}>All openings</button> / Patterns
      </div>
      <h1>Win and failure patterns</h1>
      <p className="muted">Every known mistake collected in the book lines. Failure patterns are moves on your side that get punished; win patterns are opponent slips you should punish.</p>
      <div className="segmented">
        <button className={tab === 'fail' ? 'on' : ''} onClick={() => setTab('fail')}>Failure patterns ({PATTERNS.filter((p) => p.mine).length})</button>
        <button className={tab === 'win' ? 'on' : ''} onClick={() => setTab('win')}>Win patterns ({PATTERNS.filter((p) => !p.mine).length})</button>
      </div>
      <ul className="pattern-list">
        {list.map((p) => {
          const key = `${p.course.id}-${p.node.id}-${p.move.usi}`
          const setup = SETUPS.find((s) => s.id === p.course.setupId)
          return (
            <li key={key} className={`pattern ${p.mine ? 'v-mistake' : 'v-opponent-mistake'}`}>
              <div className="pattern-head">
                <span className="pattern-move">{p.ply}. {moveText(p.node.sfen, p.move.usi)}</span>
                <span className="muted small">{setup?.ja}: {p.course.title}</span>
              </div>
              {p.move.note && <p>{p.move.note}</p>}
              {p.move.punishNote && <p className="pattern-punish">{p.mine ? 'How it gets punished: ' : 'How you punish it: '}{p.move.punishNote}</p>}
              <div className="row">
                <button onClick={() => setOpen(open === key ? null : key)}>{open === key ? 'Hide position' : 'Show position'}</button>
                <button className="primary" onClick={() => go('course', p.course.id, p.node.id)}>Practice from here</button>
              </div>
              {open === key && (
                <div className="pattern-board">
                  <Board sfen={p.node.sfen} flipped={p.course.userSide === 'gote'} interactive={false} arrows={[{ usi: p.move.usi, color: p.mine ? '#c0392b' : '#1baca6' }]} />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
