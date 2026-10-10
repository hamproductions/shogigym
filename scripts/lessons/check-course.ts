import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { InitialPositionSFEN, Position, parseMoves, type Move } from 'tsshogi'
import { bookMoves } from './book'
import { overlaps, textsOf } from './originality'

type Segment = { moves: string; kind?: string; notes?: Record<number, string>; comment?: string; branches?: Segment[] }

const useEngine = process.argv.includes('--engine')
let failures = 0
for (const id of process.argv.slice(2).filter((arg) => !arg.startsWith('--'))) {
  const errors: string[] = []
  const notes: string[] = []
  const { default: spec } = await import(pathToFileURL(`${process.cwd()}/scripts/courses/${id}.mjs`).href)
  const start = Position.newBySFEN(spec.startSfen ?? InitialPositionSFEN.STANDARD)!
  const line: { sfen: string; usi: string }[] = []
  const parse = (position: Position, segment: Segment, last: Move | undefined, main: boolean) => {
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
    for (const move of moves) {
      if (main) line.push({ sfen: p.sfen, usi: move.usi })
      p.doMove(move)
    }
    const children = segment.branches ?? []
    const mainChild = children.find((child) => (child.kind ?? 'main') === 'main')
    for (const child of children) parse(p, child, moves.at(-1), main && child === mainChild)
    return p
  }
  let end: Position | undefined
  try {
    end = parse(start, spec.line, undefined, true)
  } catch (error) {
    errors.push((error as Error).message)
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
    const scores = execFileSync('node', ['scripts/lessons/engine-eval.mjs', '400'], {
      input: [...line.map((s) => s.sfen), end.sfen].join('\n'),
      encoding: 'utf8',
      timeout: 600000,
    })
      .trim()
      .split('\n')
      .map((row) => row.split(' '))
    line.forEach((step, i) => {
      const loss = Number(scores[i][0]) + Number(scores[i + 1][0])
      if (loss > 300) notes.push(`ply ${i + 1} ${step.usi}: engine loss ${loss} (engine prefers ${scores[i][1]})`)
    })
    notes.push(`final eval for side to move: ${scores.at(-1)![0]}`)
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
