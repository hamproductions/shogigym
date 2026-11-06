import { pathToFileURL } from 'node:url'
import { Color, InitialPositionSFEN, Position, parseMoves, type Move } from 'tsshogi'
import { bookMoves } from './book'
import { pawnCapturesOfNonPawns, unrecapturedMajorCaptures } from './capture-notes'
import { evaluate } from './engine-scores'
import { overlaps, textsOf } from './originality'

type Segment = { moves: string; kind?: string; notes?: Record<number, string>; comment?: string; branches?: Segment[] }

const useEngine = process.argv.includes('--engine')
const withBranches = process.argv.includes('--branches')

let failures = 0
for (const id of process.argv.slice(2).filter((arg) => !arg.startsWith('--'))) {
  const errors: string[] = []
  const notes: string[] = []
  const capturePositions = new Set<string>()
  const { default: spec } = await import(pathToFileURL(`${process.cwd()}/scripts/courses/${id}.mjs`).href)
  const start = Position.newBySFEN(spec.startSfen ?? InitialPositionSFEN.STANDARD)!
  const line: { sfen: string; usi: string }[] = []
  const edges: { sfen: string; after: string; usi: string; path: string; ply: number; kind: string; color: Color; route: string }[] = []
  const noteCaptures = (position: Position, where: string) => {
    for (const capture of pawnCapturesOfNonPawns(position)) {
      const key = `pawn:${position.sfen.split(' ').slice(0, 3).join(' ')}:${capture.usi}`
      if (capturePositions.has(key)) continue
      capturePositions.add(key)
      notes.push(`${where}: pawn ${capture.usi} can capture ${capture.target}; inspect the complete exchange even if it is guarded (${position.sfen})`)
    }
    for (const capture of unrecapturedMajorCaptures(position)) {
      const key = `${position.sfen.split(' ').slice(0, 3).join(' ')}:${capture}`
      if (capturePositions.has(key)) continue
      capturePositions.add(key)
      notes.push(`${where}: ${capture} can capture a major piece without immediate board recapture (${position.sfen})`)
    }
  }
  const parse = (position: Position, segment: Segment, last: Move | undefined, main: boolean, path = 'line', route: string[] = []): Position => {
    noteCaptures(position, `${path} start`)
    const tokens = segment.moves.trim().split(/\s+/)
    let moves: Move[]
    if (tokens.every((t) => /^([1-9][a-i]|[PLNSGBR]\*)[1-9][a-i]\+?$/.test(t))) {
      const p = position.clone()
      moves = tokens.map((usi) => {
        const move = p.createMoveByUSI(usi)
        if (!move || !p.doMove(move)) throw new Error(`illegal ${usi} in "${segment.moves}"`)
        return move
      })
    } else {
      const [parsed, error] = parseMoves(position, segment.moves, last)
      if (error) throw new Error(`${error.message} in "${segment.moves}"`)
      moves = parsed
    }
    const p = position.clone()
    const played = [...route]
    for (const [i, move] of moves.entries()) {
      const sfen = p.sfen
      if (main) line.push({ sfen: p.sfen, usi: move.usi })
      p.doMove(move)
      played.push(move.usi)
      edges.push({
        sfen,
        after: p.sfen,
        usi: move.usi,
        path,
        ply: i + 1,
        kind: i === 0 ? (segment.kind ?? 'main') : 'main',
        color: move.color,
        route: played.join(' '),
      })
      noteCaptures(p, `${path} ply ${i + 1} after ${move.usi}`)
    }
    const children = segment.branches ?? []
    const mainChild = children.find((child) => (child.kind ?? 'main') === 'main')
    let end = p
    for (const [index, child] of children.entries()) {
      const terminal = parse(p, child, moves.at(-1), main && child === mainChild, `${path}.branches[${index}]`, played)
      if (child === mainChild) end = terminal
    }
    return end
  }
  let end: Position | undefined
  try {
    end = parse(start, spec.line, undefined, true)
  } catch (error) {
    errors.push((error as Error).message)
  }
  const rank: Record<string, number> = { main: 0, alt: 1, deviation: 2 }
  const merged = new Map<string, string>()
  for (const edge of edges) {
    const previous = merged.get(edge.route)
    if (!previous || rank[edge.kind] < rank[previous]) merged.set(edge.route, edge.kind)
  }
  for (const edge of edges) {
    const kind = merged.get(edge.route)!
    if (edge.kind === 'deviation' && kind !== 'deviation')
      notes.push(`${edge.path} ply ${edge.ply} ${edge.usi}: deviation merges into ${kind}; split the shared prefix before the intended mistake`)
    edge.kind = kind
  }
  if (/将棋ルール|shogi-rule|joutatsu|hibitonshi|shogilounge|shogijam|thirdfilerook/.test(`${spec.title} ${spec.id}`))
    errors.push('title or id names a copyrighted source')
  for (const [i, step] of line.entries()) {
    const entry = bookMoves(step.sfen)
    if (entry && !entry.some(({ usi }) => usi === step.usi))
      notes.push(
        `ply ${i + 1} ${step.usi} outside book (book: ${entry
          .slice(0, 3)
          .map(({ usi, ev }) => `${usi} ${ev}`)
          .join(', ')})`,
      )
  }
  if (useEngine && end && line.length) {
    if (withBranches) {
      const scores = evaluate(edges.flatMap((edge) => [edge.sfen, edge.after]))
      const side = spec.userSide ?? spec.mySide
      edges.forEach((edge, i) => {
        const loss = scores[i * 2].score + scores[i * 2 + 1].score
        const role = side ? (edge.color === (side === 'gote' ? Color.WHITE : Color.BLACK) ? 'learner' : 'opponent') : 'side to move'
        if (loss > 300)
          notes.push(
            `${edge.path} ply ${edge.ply} ${edge.usi} (${role}, merged edge ${edge.kind}): engine loss ${loss} (engine prefers ${scores[i * 2].best})${scores[i * 2 + 1].pv.length ? `; reply PV: ${scores[i * 2 + 1].pv.slice(0, 6).join(' ')}` : ''}`,
          )
      })
      notes.push(`engine branch coverage: ${edges.length} moves, ${new Set(edges.flatMap((edge) => [edge.sfen, edge.after])).size} distinct positions`)
    } else {
      const scores = evaluate([...line.map((s) => s.sfen), end.sfen])
      line.forEach((step, i) => {
        const loss = scores[i].score + scores[i + 1].score
        if (loss > 300)
          notes.push(
            `ply ${i + 1} ${step.usi}: engine loss ${loss} (engine prefers ${scores[i].best})${scores[i + 1].pv.length ? `; reply PV: ${scores[i + 1].pv.slice(0, 6).join(' ')}` : ''}`,
          )
      })
    }
    notes.push(`final eval for side to move: ${evaluate([end.sfen])[0].score}`)
  }
  const { source: _source, ...rest } = spec
  for (const finding of overlaps(textsOf(rest, id)))
    errors.push(`${finding.where}: ${(finding.share * 100).toFixed(0)}% shared${finding.runs.map((run) => `\n    "${run.phrase}" <- ${run.doc}`).join('')}`)
  console.log(`${id}: ${errors.length ? 'FAIL' : 'ok'} (${line.length} main-line moves)`)
  for (const error of errors) console.log(`  ERROR ${error}`)
  for (const note of notes) console.log(`  NOTE ${note}`)
  if (errors.length) failures++
}
process.exit(failures ? 1 : 0)
