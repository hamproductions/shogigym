import { Color, PieceType, Position, Square, formatMove, parseMoves, type Move } from 'tsshogi'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'

type Text = { ja: string; en: string }
type Occ = {
  index: number
  part?: number | null
  url: string
  caption: string
  kind: 'board' | 'crop' | 'pieces'
  placement?: string
  hands?: string
  handsShown?: string[]
  flipped?: boolean
  lastTo?: string | null
  turn?: string
  label?: Text
  arrows?: string[]
  ghosts?: string[]
  boxes?: string[]
  dashed?: string[]
  crop?: { panels?: unknown[]; items?: unknown[]; label?: Text; cycle?: boolean }
}

const WORK = '.cache/extract'
const SOURCE = '.cache/curriculum-source'
const OUT = 'data/lessons/figures'
const INITIAL = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL'
const KANJI_RANK = '一二三四五六七八九'

const sequences: Record<string, Occ[]> = JSON.parse(readFileSync(`${WORK}/sequences.json`, 'utf8'))
const english: Record<string, string> = Object.assign(
  {},
  ...readdirSync(`${WORK}/i18n`)
    .filter((f) => /^en_\d+\.json$/.test(f))
    .map((f) => JSON.parse(readFileSync(`${WORK}/i18n/${f}`, 'utf8'))),
)

const readJson = (path: string) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {})
const steps: Record<string, Text> = {}
for (const file of readdirSync(`${WORK}/i18n`).filter((f) => /^step_\w+\.json$/.test(f)))
  for (const [key, value] of Object.entries(readJson(`${WORK}/i18n/${file}`) as Record<string, Text>)) if (value.ja && value.en) steps[key] = value
const manualLines: Record<string, Record<string, Omit<Line, 'text'>>> = readJson('scripts/lessons/source-lesson-lines.json')
const segments: Record<string, { heading: string }> = readJson(`${WORK}/segments.json`)
const headingsEn: Record<string, string> = readJson(`${WORK}/i18n/headings_en.json`)
const norm = (s: string) => s.normalize('NFKC').replace(/\s+/g, ' ').trim()
const labelOf = (caption: string) => {
  const m = /^((?:図|問題|参考図|テーマ図|基本図|正解図|失敗図)[^\s】]*)/.exec(norm(caption).replace(/^【/, ''))
  return m ? m[1].replace(/[’′']/g, "'") : null
}
const stripBrackets = (s: string) =>
  s
    .trim()
    .replace(/^【\s*/, '')
    .replace(/\s*】$/, '')
const englishLabel = (label: string) =>
  label
    .replace(/^問題/, 'Problem ')
    .replace(/^参考図/, 'Reference diagram ')
    .replace(/^テーマ図/, 'Theme diagram ')
    .replace(/^基本図/, 'Basic diagram ')
    .replace(/^正解図/, 'Answer diagram ')
    .replace(/^失敗図/, 'Failure diagram ')
    .replace(/^図/, 'Figure ')
    .trim()

function grid(placement: string) {
  const rows: (string | null)[][] = []
  for (const row of placement.split('/')) {
    const out: (string | null)[] = []
    let promote = false
    for (const ch of row) {
      if (/\d/.test(ch)) for (let i = 0; i < +ch; i++) out.push(null)
      else if (ch === '+') promote = true
      else {
        out.push((promote ? '+' : '') + ch)
        promote = false
      }
    }
    rows.push(out)
  }
  return rows
}
const serialize = (rows: (string | null)[][]) =>
  rows
    .map((r) =>
      r
        .map((c) => c ?? '.')
        .join('')
        .replace(/\.+/g, (m) => String(m.length)),
    )
    .join('/')
const colorOf = (c: string) => (c.replace('+', '') === c.replace('+', '').toUpperCase() ? 'b' : 'w')
const keep = (placement: string, colors: string[]) => serialize(grid(placement).map((r) => r.map((c) => (c && colors.includes(colorOf(c)) ? c : null))))
const colorsIn = (placement: string) => [
  ...new Set(
    grid(placement)
      .flat()
      .filter((c): c is string => !!c)
      .map(colorOf),
  ),
]

function handCounts(hands: string) {
  const counts: Record<'b' | 'w', Record<string, number>> = { b: {}, w: {} }
  for (const m of hands === '-' ? [] : hands.matchAll(/(\d*)([RBGSNLPrbgsnlp])/g))
    counts[m[2] === m[2].toUpperCase() ? 'b' : 'w'][m[2].toUpperCase()] = +(m[1] || 1)
  return counts
}
function handString(counts: Record<'b' | 'w', Record<string, number>>) {
  let out = ''
  for (const side of ['b', 'w'] as const)
    for (const p of 'RBGSNLP') {
      const n = counts[side][p] ?? 0
      if (n) out += (n > 1 ? n : '') + (side === 'b' ? p : p.toLowerCase())
    }
  return out || '-'
}
const visibleHands = (occ: Occ) => {
  const counts = handCounts(occ.hands ?? '-')
  for (const side of ['b', 'w'] as const) if (!(occ.handsShown ?? []).includes(side)) counts[side] = {}
  return counts
}

const TOKEN =
  /([▲△☗☖])\s*((?:[1-9][一二三四五六七八九]|同\s*)(?:成香|成桂|成銀|[歩香桂銀金角飛玉王と馬龍竜])(?:右|左|直)?(?:上|引|寄|行)?(?:打)?(?:不成|成|生)?)/g

function replay(start: string, tokens: RegExpMatchArray[]) {
  let position = Position.newBySFEN(start)
  if (!position) return null
  const moves: string[] = []
  let sides = ''
  let last: Move | undefined
  for (const t of tokens) {
    const color = t[1] === '▲' || t[1] === '☗' ? 'b' : 'w'
    if ((position.color === Color.BLACK ? 'b' : 'w') !== color) {
      const parts = position.sfen.split(' ')
      position = Position.newBySFEN(`${parts[0]} ${color} ${parts[2]} 1`)!
    }
    const text = t[0].replace(/\s/g, '').replace('竜', '龍').replace('王', '玉').replace('生', '不成')
    const [parsed, err] = parseMoves(position, text, last)
    if (err || parsed.length !== 1 || !position.isValidMove(parsed[0])) return { failedAt: t[0], position }
    position.doMove(parsed[0])
    last = parsed[0]
    moves.push(parsed[0].usi)
    sides += color
  }
  return { moves, sides, position }
}

function legalMoves(p: Position): Move[] {
  const out: Move[] = []
  const squares: Square[] = []
  for (let f = 1; f <= 9; f++) for (let r = 1; r <= 9; r++) squares.push(new Square(f, r))
  for (const from of squares) {
    const piece = p.board.at(from)
    if (!piece || piece.color !== p.color) continue
    for (const to of squares) {
      const mv = p.createMove(from, to)
      if (!mv) continue
      if (p.isValidMove(mv)) out.push(mv)
      const pm = mv.withPromote()
      if (pm.promote && p.isValidMove(pm)) out.push(pm)
    }
  }
  const hand = p.color === Color.BLACK ? p.blackHand : p.whiteHand
  for (const type of [PieceType.ROOK, PieceType.BISHOP, PieceType.GOLD, PieceType.SILVER, PieceType.KNIGHT, PieceType.LANCE, PieceType.PAWN]) {
    if (!hand.count(type)) continue
    for (const to of squares) {
      const mv = p.createMove(type, to)
      if (mv && p.isValidMove(mv)) out.push(mv)
    }
  }
  return out
}

const withColor = (p: Position, color: string) => {
  if ((p.color === Color.BLACK ? 'b' : 'w') === color) return p.clone()
  const parts = p.sfen.split(' ')
  return Position.newBySFEN(`${parts[0]} ${color} ${parts[2]} 1`)!
}

function untouchedFix(start: string, tokens: RegExpMatchArray[], target: string) {
  const replayed = replay(start, tokens)
  if (!replayed || 'failedAt' in replayed) return null
  const got = grid(replayed.position.sfen.split(' ')[0])
  const want = grid(target)
  const touched = new Set(replayed.moves.flatMap((usi) => [usi.slice(0, 2), usi.slice(2, 4)]))
  const diff: [number, number][] = []
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (got[r][c] !== want[r][c]) diff.push([r, c])
  if (!diff.length || diff.length > 3 || diff.some(([r, c]) => touched.has(`${9 - c}${'abcdefghi'[r]}`))) return null
  const parts = start.split(' ')
  const board = grid(parts[0])
  for (const [r, c] of diff) board[r][c] = want[r][c]
  const fixed = `${serialize(board)} ${parts.slice(1).join(' ')}`
  const again = replay(fixed, tokens)
  if (!again || 'failedAt' in again || again.position.sfen.split(' ')[0] !== target) return null
  return { start: fixed, moves: again.moves, sides: again.sides, adjusted: diff.map(([r, c]) => `${9 - c}${KANJI_RANK[r]}`) }
}

function reconcile(start: string, tokens: RegExpMatchArray[], target: string, structural: boolean, budget = 2, near = false) {
  const root = Position.newBySFEN(start)
  if (!root) return null
  const found: { cost: number; moves: string[]; sides: string; corrected: { index: number; stated: string; played: string }[] }[] = []
  let nodes = 0
  const walk = (
    p: Position,
    i: number,
    cost: number,
    moves: string[],
    sides: string,
    corrected: { index: number; stated: string; played: string }[],
    last?: Move,
  ) => {
    if (++nodes > 1500000 || found.length > 6) return
    if (i === tokens.length) {
      if (p.sfen.split(' ')[0] === target) return found.push({ cost, moves, sides, corrected })
      if (cost >= budget || !structural) return
      for (const side of ['b', 'w']) {
        const other = withColor(p, side)
        for (const mv of legalMoves(other)) {
          const q = other.clone()
          const label = formatMove(other, mv)
          q.doMove(mv)
          walk(q, i, cost + 1, [...moves, mv.usi], sides + side, [...corrected, { index: moves.length, stated: '', played: label }], mv)
        }
      }
      return
    }
    const color = tokens[i][1] === '▲' || tokens[i][1] === '☗' ? 'b' : 'w'
    const at = withColor(p, color)
    const text = tokens[i][0].replace(/\s/g, '').replace('竜', '龍').replace('王', '玉').replace('生', '不成')
    const [parsed, err] = parseMoves(at, text, last)
    const exact = !err && parsed.length === 1 && at.isValidMove(parsed[0]) ? parsed[0] : null
    const step = (base: Position, mv: Move, side: string, next: number, extra: number, note?: { stated: string; played: string }) => {
      const q = base.clone()
      const label = formatMove(base, mv)
      q.doMove(mv)
      walk(
        q,
        next,
        cost + extra,
        [...moves, mv.usi],
        sides + side,
        note ? [...corrected, { index: moves.length, stated: note.stated, played: note.played || label }] : corrected,
        mv,
      )
    }
    const stated = tokens[i][0].replace(/\s/g, '')
    if (exact) step(at, exact, color, i + 1, 0)
    if (cost < budget) {
      const square = /([1-9])([一二三四五六七八九])/.exec(stated)
      const dest = square ? `${square[1]}${'abcdefghi'['一二三四五六七八九'.indexOf(square[2])]}` : last?.usi.slice(2, 4)
      const kind = /(成香|成桂|成銀|[歩香桂銀金角飛玉王と馬龍竜])/.exec(stated)?.[1]
      for (const mv of legalMoves(at))
        if ((!exact || mv.usi !== exact.usi) && (!near || mv.usi.slice(2, 4) === dest || (kind && formatMove(at, mv).includes(kind))))
          step(at, mv, color, i + 1, 1, { stated, played: '' })
      if (structural) {
        walk(p, i + 1, cost + 1, moves, sides, [...corrected, { index: moves.length, stated, played: '' }], last)
        for (const side of ['b', 'w']) {
          const other = withColor(p, side)
          for (const mv of legalMoves(other)) step(other, mv, side, i, 1, { stated: '', played: '' })
        }
      }
    }
  }
  walk(root, 0, 0, [], '', [])
  const useful = found.filter((f) => f.moves.length > 0 && f.corrected.filter((c) => c.stated && !c.played).length < tokens.length)
  if (!useful.length) return null
  const best = Math.min(...useful.map((f) => f.cost))
  const top = useful.filter((f) => f.cost === best)
  const unique = new Set(top.map((f) => f.moves.join(' ')))
  return unique.size === 1 && nodes <= 1500000 ? top[0] : null
}

type Line = {
  from: string | null
  start: string
  moves: string[]
  sides: string
  text: string
  corrected?: { index: number; stated: string; played: string }[]
  adjusted?: string[]
  statedFrom?: string
  prose?: string
  swappedMarks?: boolean
  note?: Text
}

function extractLines(article: string, occ: Occ[]) {
  const lines = new Map<string, Line>()
  const unmatched = new Map<string, string>()
  const failures: string[] = []
  const path = `${SOURCE}/${article}.txt`
  if (!existsSync(path)) return { lines, failures, unmatched }
  const byLabel = new Map<string, Occ>()
  for (const o of occ) {
    const l = labelOf(o.caption)
    if (l && o.kind === 'board' && !byLabel.has(l)) byLabel.set(l, o)
  }
  const rows = readFileSync(path, 'utf8').split('\n').map(norm)
  const captionRow = new Map<Occ, number>()
  const used = new Set<number>()
  for (const o of occ) {
    const caption = norm(o.caption)
    const at = rows.findIndex((r, k) => r === caption && !used.has(k))
    if (at >= 0) {
      used.add(at)
      captionRow.set(o, at)
    }
  }
  const labelled = (label: string, row: number, after: boolean) => {
    const key = label.replace(/[’′']/g, "'")
    const all = occ.filter((o) => o.kind === 'board' && labelOf(o.caption) === key && captionRow.has(o))
    if (!all.length) return byLabel.get(key)
    const sorted = all.sort((a, b) => captionRow.get(a)! - captionRow.get(b)!)
    return after ? (sorted.find((o) => captionRow.get(o)! > row) ?? sorted.at(-1)) : ([...sorted].reverse().find((o) => captionRow.get(o)! < row) ?? sorted[0])
  }
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const ref = /[(（]((?:図|参考図|テーマ図|基本図)[^)）]*)[)）]\s*$/.exec(row)
    if (!ref) continue
    const target = labelled(ref[1], i, true)
    if (!target) continue
    const body = row.slice(0, ref.index)
    const tokens = [...body.matchAll(TOKEN)]
    const statedTokens = tokens
    if (!tokens.length) continue
    let fromLabel: string | null = null
    let initial = /^初手から/.test(body)
    const inline = /((?:図|参考図|テーマ図|基本図)[^\sから]*)から/.exec(body)
    if (inline) fromLabel = inline[1]
    for (let k = i - 1; k >= Math.max(0, i - 3) && !fromLabel && !initial; k--) {
      const joined = /^からの指し手/.test(rows[k]) && k > 0 ? rows[k - 1] + rows[k] : rows[k]
      const h = /^((?:図|参考図|テーマ図|基本図).+?)からの指し手/.exec(joined)
      if (h) fromLabel = h[1]
      else if (/^初手からの指し手/.test(joined)) initial = true
      if (/からの指し手|^\S*[▲△]/.test(rows[k]) && !h && !initial && k < i - 1) break
    }
    const named = fromLabel ? labelled(fromLabel, i, false) : undefined
    const nearest = occ.filter((o) => o.index < target.index && o.kind === 'board').reverse()
    const starts: (Occ | null)[] = initial ? [null] : named ? [named] : nearest.length ? [nearest[0]] : []
    const fallbacks: (Occ | null)[] = [
      ...(initial ? [] : named ? nearest.filter((o) => o !== named).slice(0, 3) : nearest.slice(1)),
      ...(initial ? [] : [null]),
    ]
    const attempt = (fromOcc: Occ | null, tokens: RegExpMatchArray[] = statedTokens) => {
      const colors = colorsIn(target.placement!)
      const placement = keep(fromOcc ? fromOcc.placement! : INITIAL, colors)
      const first = tokens[0][1] === '▲' || tokens[0][1] === '☗' ? 'b' : 'w'
      const hands = fromOcc ? visibleHands(fromOcc) : handCounts('-')
      const hidden = fromOcc ? (['b', 'w'] as const).filter((s) => !(fromOcc.handsShown ?? []).includes(s)) : ['b', 'w']
      let result: ReturnType<typeof replay> = null
      for (let round = 0; round < 12; round++) {
        result = replay(`${placement} ${first} ${handString(hands)} 1`, tokens)
        if (!result || !('failedAt' in result)) break
        const drop = /^([▲△☗☖])[1-9][一二三四五六七八九](歩|香|桂|銀|金|角|飛)打?$/.exec(result.failedAt.replace(/\s/g, ''))
        const side = drop && (drop[1] === '▲' || drop[1] === '☗' ? 'b' : 'w')
        const piece = drop && { 歩: 'P', 香: 'L', 桂: 'N', 銀: 'S', 金: 'G', 角: 'B', 飛: 'R' }[drop[2]]
        if (!side || !piece || !(hidden as string[]).includes(side)) break
        hands[side as 'b' | 'w'][piece] = (hands[side as 'b' | 'w'][piece] ?? 0) + 1
      }
      if (!result || 'failedAt' in result) return { reason: `parse ${result && 'failedAt' in result ? result.failedAt : 'start'}` }
      if (result.position.sfen.split(' ')[0] !== target.placement) {
        const got = grid(result.position.sfen.split(' ')[0]).flat()
        const want = grid(target.placement!).flat()
        const diff = got.flatMap((c, i) => (c !== want[i] ? [`${9 - (i % 9)}${KANJI_RANK[Math.floor(i / 9)]}:${c ?? '.'}→${want[i] ?? '.'}`] : []))
        return { reason: `mismatch ${diff.length} ${diff.slice(0, 4).join(' ')} ${target.url.split('/').at(-1)}` }
      }
      return { fromOcc, start: `${placement} ${first} ${handString(hands)} 1`, result }
    }
    if (!starts.length && !fallbacks.length) {
      failures.push(`${row} :: no source figure`)
      if (!unmatched.has(diagramId(target))) unmatched.set(diagramId(target), body.trim())
      continue
    }
    let found: ReturnType<typeof attempt> | undefined
    let reason = 'no source figure'
    for (const candidate of [...starts, ...fallbacks]) {
      const tried = attempt(candidate)
      if ('result' in tried) {
        found = tried
        break
      }
      if (starts.includes(candidate)) reason = tried.reason
    }
    if (!found || !('result' in found)) {
      const id = diagramId(target)
      let repaired: (ReturnType<typeof reconcile> & { fromOcc: Occ | null; start: string }) | null = null
      for (const [structural, budget, near] of [
        [false, 2, false],
        [true, 2, false],
        [false, 4, true],
      ] as const)
        for (const candidate of [...starts, ...fallbacks]) {
          if (repaired) break
          if (candidate === target) continue
          const colors = colorsIn(target.placement!)
          const placement = keep(candidate ? candidate.placement! : INITIAL, colors)
          const first = tokens[0][1] === '▲' || tokens[0][1] === '☗' ? 'b' : 'w'
          const hands = candidate ? visibleHands(candidate) : handCounts('-')
          const start = `${placement} ${first} ${handString(hands)} 1`
          const fix = reconcile(start, tokens, target.placement!, structural, budget, near)
          if (fix) repaired = { ...fix, fromOcc: candidate, start }
        }
      if (!repaired)
        for (const candidate of [...starts, ...fallbacks]) {
          if (candidate === target) continue
          const colors = colorsIn(target.placement!)
          const placement = keep(candidate ? candidate.placement! : INITIAL, colors)
          const first = tokens[0][1] === '▲' || tokens[0][1] === '☗' ? 'b' : 'w'
          const fix = untouchedFix(`${placement} ${first} ${handString(candidate ? visibleHands(candidate) : handCounts('-'))} 1`, tokens, target.placement!)
          if (fix && !lines.has(id)) {
            lines.set(id, {
              ...(named && candidate !== named ? { statedFrom: fromLabel! } : {}),
              from: candidate ? diagramId(candidate) : null,
              start: fix.start,
              moves: fix.moves,
              sides: fix.sides,
              text: body.replace(/^初手から(の指し手)?\s*/, '').trim(),
              adjusted: fix.adjusted,
            })
            break
          }
        }
      if (lines.has(id)) continue
      if (repaired && !lines.has(id)) {
        const head = repaired.start.split(' ')
        lines.set(id, {
          ...(named && repaired.fromOcc !== named ? { statedFrom: fromLabel! } : {}),
          from: repaired.fromOcc ? diagramId(repaired.fromOcc) : null,
          start: `${head[0]} ${repaired.sides[0]} ${head.slice(2).join(' ')}`,
          moves: repaired.moves,
          sides: repaired.sides,
          text: body.replace(/^初手から(の指し手)?\s*/, '').trim(),
          corrected: repaired.corrected,
        })
        continue
      }
      const targetRow = captionRow.get(target) ?? i
      const fromRow = Math.max(0, i - 8)
      const nearby = rows.slice(fromRow, Math.min(rows.length, targetRow + 6)).filter((r) => r !== row)
      const proseRuns = nearby.map((r) => [...r.matchAll(TOKEN)]).filter((run) => run.length)
      let prosed = false
      for (const run of proseRuns) {
        for (const order of [
          [...tokens, ...run],
          [...run, ...tokens],
        ]) {
          for (const candidate of [...starts, ...fallbacks]) {
            if (prosed || candidate === target) continue
            const tried = attempt(candidate, order)
            if ('result' in tried && tried.result.moves.length && !lines.has(id)) {
              lines.set(id, {
                from: candidate ? diagramId(candidate) : null,
                start: tried.start,
                moves: tried.result.moves,
                sides: tried.result.sides,
                text: body.replace(/^初手から(の指し手)?\s*/, '').trim(),
                prose: run.map((t) => t[0].replace(/\s/g, '')).join('、'),
              })
              prosed = true
            }
          }
        }
      }
      if (prosed) continue
      const swapped = statedTokens.map((t) => {
        const text = t[0].replace(/^[▲☗]/, '◇').replace(/^[△☖]/, '▲').replace(/^◇/, '△')
        return [...text.matchAll(TOKEN)][0]
      })
      let flipped = false
      for (const candidate of [...starts, ...fallbacks]) {
        if (flipped || candidate === target) continue
        const tried = attempt(candidate, swapped)
        if ('result' in tried && tried.result.moves.length && !lines.has(id)) {
          lines.set(id, {
            from: candidate ? diagramId(candidate) : null,
            start: tried.start,
            moves: tried.result.moves,
            sides: tried.result.sides,
            text: body.replace(/^初手から(の指し手)?\s*/, '').trim(),
            swappedMarks: true,
          })
          flipped = true
          continue
        }
        const colors = colorsIn(target.placement!)
        const placement = keep(candidate ? candidate.placement! : INITIAL, colors)
        const first = swapped[0][1] === '▲' ? 'b' : 'w'
        const start = `${placement} ${first} ${handString(candidate ? visibleHands(candidate) : handCounts('-'))} 1`
        const fix = reconcile(start, swapped, target.placement!, false, 2, false)
        if (fix && !lines.has(id)) {
          lines.set(id, {
            from: candidate ? diagramId(candidate) : null,
            start: `${placement} ${fix.sides[0]} ${start.split(' ')[2]} 1`,
            moves: fix.moves,
            sides: fix.sides,
            text: body.replace(/^初手から(の指し手)?\s*/, '').trim(),
            corrected: fix.corrected,
            swappedMarks: true,
          })
          flipped = true
        }
      }
      if (flipped) continue
      failures.push(`${row} :: ${reason}`)
      if (!unmatched.has(diagramId(target))) unmatched.set(diagramId(target), body.replace(/^初手から(の指し手)?\s*/, '').trim())
      continue
    }
    const { fromOcc, start, result } = found
    const initialStart = !fromOcc
    const id = diagramId(target)
    if (lines.has(id)) continue
    lines.set(id, {
      ...(named && fromOcc !== named ? { statedFrom: fromLabel! } : {}),
      from: initialStart ? null : diagramId(fromOcc!),
      start,
      moves: result.moves,
      sides: result.sides,
      text: body.replace(/^初手から(の指し手)?\s*/, '').trim(),
    })
  }
  return { lines, failures, unmatched }
}

const diagramId = (o: Occ) => (o.part != null ? `${o.index}-${o.part}` : String(o.index))
const square = (usiSquare: string) => `${usiSquare[0]}${KANJI_RANK['abcdefghi'.indexOf(usiSquare[1])]}`
const usiSquare = (kanji: string) => `${kanji[0]}${'abcdefghi'[KANJI_RANK.indexOf(kanji[1])]}`

function title(o: Occ, ordinal: number): Text {
  if (o.label) return o.label
  const ja = stripBrackets(o.caption)
  if (!ja) return { ja: `局面${ordinal}`, en: `Position ${ordinal}` }
  const en = english[o.caption.trim()] ?? english[o.caption] ?? (labelOf(o.caption) ? englishLabel(labelOf(o.caption)!) : '')
  return { ja, en: en || ja }
}

if (existsSync(OUT)) rmSync(OUT, { recursive: true })
mkdirSync(OUT, { recursive: true })
const report = { articles: 0, diagrams: 0, boards: 0, crops: 0, lines: 0, failures: 0, missingEnglish: 0 }
const failureLog: Record<string, string[]> = {}
for (const [article, occ] of Object.entries(sequences)) {
  const { lines, failures, unmatched } = extractLines(article, occ)
  for (const [id, manual] of Object.entries(manualLines[article] ?? {})) {
    if (lines.has(id)) continue
    lines.set(id, { ...manual, text: unmatched.get(id) ?? '' })
    unmatched.delete(id)
  }
  failureLog[article] = failures
  const outgoing = new Map<string, string>()
  for (const line of lines.values()) if (line.from && !outgoing.has(line.from)) outgoing.set(line.from, line.sides[0])
  const diagrams = occ.map((o, i) => {
    const id = diagramId(o)
    const t = title(o, i + 1)
    if (t.en === t.ja && /[ぁ-んァ-ン一-龯]/.test(t.ja)) report.missingEnglish++
    const base: Record<string, unknown> = { id, title: t, source: o.url }
    const step = steps[`${article}:${id}`]
    if (step?.ja && step?.en) base.explain = { ja: step.ja, en: step.en }
    const heading = segments[`${article}:${id}`]?.heading
    if (heading) base.section = { ja: heading, en: headingsEn[heading] ?? heading }
    if (o.kind !== 'board') {
      report.crops++
      const { label: _label, kind: _kind, ...crop } = (o.crop ?? {}) as Record<string, unknown>
      return { ...base, [o.kind === 'pieces' ? 'pieces' : 'crop']: crop }
    }
    report.boards++
    const line = lines.get(id)
    const turn = outgoing.get(id) ?? (line ? (line.sides.at(-1) === 'b' ? 'w' : 'b') : (o.turn ?? 'b'))
    const shown = o.handsShown ?? []
    const probe = Position.newBySFEN(`${o.placement} ${turn} ${handString(visibleHands(o))} 1`)
    const waiting = turn === 'b' ? Color.WHITE : Color.BLACK
    const fixedTurn = probe && probe.board.isChecked(waiting) ? (turn === 'b' ? 'w' : 'b') : turn
    const diagram: Record<string, unknown> = { ...base, sfen: `${o.placement} ${fixedTurn} ${handString(visibleHands(o))} 1` }
    if (o.flipped) diagram.view = 'gote'
    if (shown.length < 2) diagram.handsHidden = shown.length ? (shown.includes('b') ? 'w' : 'b') : 'both'
    if (
      colorsIn(o.placement!).length < 2 ||
      !grid(o.placement!)
        .flat()
        .some((c) => c === 'K') ||
      !grid(o.placement!)
        .flat()
        .some((c) => c === 'k')
    )
      diagram.partial = true
    const marks: Record<string, unknown> = {}
    if (o.lastTo) marks.last = o.lastTo
    if (o.arrows?.length) marks.arrows = o.arrows
    if (o.ghosts?.length) marks.ghosts = o.ghosts
    if (o.boxes?.length) marks.boxes = o.boxes.map(usiSquare)
    if (o.dashed?.length) marks.dashed = o.dashed.map(usiSquare)
    if (Object.keys(marks).length) diagram.marks = marks
    if (line) {
      report.lines++
      diagram.line = line
    } else if (unmatched.has(id)) diagram.statedMoves = unmatched.get(id)
    return diagram
  })
  report.articles++
  report.diagrams += diagrams.length
  report.failures += failures.length
  writeFileSync(`${OUT}/${article}.json`, JSON.stringify({ id: article, diagrams }) + '\n')
}
writeFileSync(`${WORK}/line-failures.json`, JSON.stringify(failureLog, null, 1))
console.log(report)
void square
