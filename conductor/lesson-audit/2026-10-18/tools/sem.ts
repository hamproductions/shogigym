// Mechanical semantic screen over every lesson node. Output: one line per suspicion, for manual review.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { Color, PieceType, Position, Square, formatMove } from 'tsshogi'
import { PIECE_CHAR, hasLegalMove } from '/home/user/shogigym/src/utils/shogi'
import { STARTPOS, type Step, type Unit } from '/home/user/shogigym/scripts/lessons/unit'

const ROOT = '/home/user/shogigym'
const OUT = '/tmp/claude-0/-home-user-shogigym/4fdf910f-1b77-596a-a3f6-07eb3e8689ce/scratchpad/audit'
const ids = process.argv.slice(2)
const findings: string[] = []
const flag = (where: string, kind: string, detail: string) => findings.push(`${where}\t${kind}\t${detail}`)

const FW = '１２３４５６７８９'
const KN = '一二三四五六七八九'
const PIECES = '玉王飛角金銀桂香歩竜龍馬と'
// ▲７六歩 / △同　銀 / 7六歩 / ▲２二角成 / ▲５五角打 / ▲４二成銀 / ▲3三桂不成
const NOTE = new RegExp(
  `([▲△☗☖])?\\s?(?:([1-9${FW}])([${KN}])|(同)\\s?)(成[銀桂香]|[${PIECES}]|成香|成桂|成銀)((?:[右左直上寄引行入打]|不成|成)*)`,
  'g',
)
const digit = (c: string) => (FW.includes(c) ? FW.indexOf(c) + 1 : Number(c))
const pieceKey = (s: string) =>
  ({ 王: '玉', 竜: '龍', 成銀: '全', 成桂: '圭', 成香: '杏' })[s] ?? s

type Played = { file: number; rank: number; piece: string; color: Color; promote: boolean; drop: boolean; pieceAfter: string; text: string; canPromote: boolean }
const describe = (p: Position, usi: string): Played | null => {
  const move = p.createMoveByUSI(usi)
  if (!move || !p.isValidMove(move)) return null
  const to = Square.newByUSI(usi.slice(2, 4))!
  const drop = usi[1] === '*'
  const before = drop ? null : p.board.at(Square.newByUSI(usi.slice(0, 2))!)
  const type = drop ? ({ P: PieceType.PAWN, L: PieceType.LANCE, N: PieceType.KNIGHT, S: PieceType.SILVER, G: PieceType.GOLD, B: PieceType.BISHOP, R: PieceType.ROOK } as Record<string, PieceType>)[usi[0]] : before!.type
  const promote = usi.endsWith('+')
  const text = formatMove(p, move)
  const pieceAfter = promote ? PIECE_CHAR[({ [PieceType.PAWN]: PieceType.PROM_PAWN, [PieceType.LANCE]: PieceType.PROM_LANCE, [PieceType.KNIGHT]: PieceType.PROM_KNIGHT, [PieceType.SILVER]: PieceType.PROM_SILVER, [PieceType.BISHOP]: PieceType.HORSE, [PieceType.ROOK]: PieceType.DRAGON } as Record<number, PieceType>)[type]] : PIECE_CHAR[type]
  const canPromote = !drop && !promote && p.isValidMove(move.withPromote())
  return { file: to.file, rank: to.rank, piece: PIECE_CHAR[type], color: p.color, promote, drop, pieceAfter, text, canPromote }
}

const KANJI_NUM = /([1-9１-９])([一二三四五六七八九])/g
const EN_SQ = /\b([1-9])([a-i])\b|([1-9])([一二三四五六七八九])/g
const squaresJa = (t: string) => new Set([...t.matchAll(KANJI_NUM)].map((m) => `${digit(m[1])}${KN.indexOf(m[2]) + 1}`))
const squaresEn = (t: string) =>
  new Set([...t.matchAll(EN_SQ)].map((m) => (m[1] ? `${m[1]}${'abcdefghi'.indexOf(m[2]) + 1}` : `${m[3]}${KN.indexOf(m[4]) + 1}`)))

const inventory = (p: Position, where: string) => {
  const max: Record<string, number> = { 玉: 2, 飛: 2, 角: 2, 金: 4, 銀: 4, 桂: 4, 香: 4, 歩: 18 }
  const base: Record<number, string> = {
    [PieceType.PROM_PAWN]: '歩', [PieceType.PROM_LANCE]: '香', [PieceType.PROM_KNIGHT]: '桂', [PieceType.PROM_SILVER]: '銀', [PieceType.HORSE]: '角', [PieceType.DRAGON]: '飛',
  }
  const count: Record<string, number> = {}
  const pawnFiles: Record<string, boolean> = {}
  for (const s of p.board.listNonEmptySquares()) {
    const pc = p.board.at(s)!
    const k = base[pc.type] ?? PIECE_CHAR[pc.type]
    count[k] = (count[k] ?? 0) + 1
    const fwdRank = pc.color === Color.BLACK ? s.rank : 10 - s.rank
    if ((pc.type === PieceType.PAWN || pc.type === PieceType.LANCE) && fwdRank === 1) flag(where, 'STRANDED', `${PIECE_CHAR[pc.type]} on ${s.file}${s.rank}`)
    if (pc.type === PieceType.KNIGHT && fwdRank <= 2) flag(where, 'STRANDED', `knight on ${s.file}${s.rank}`)
    if (pc.type === PieceType.PAWN) {
      const key = `${pc.color}-${s.file}`
      if (pawnFiles[key]) flag(where, 'NIFU', `file ${s.file} color ${pc.color}`)
      pawnFiles[key] = true
    }
  }
  for (const c of [Color.BLACK, Color.WHITE])
    for (const t of [PieceType.ROOK, PieceType.BISHOP, PieceType.GOLD, PieceType.SILVER, PieceType.KNIGHT, PieceType.LANCE, PieceType.PAWN]) count[PIECE_CHAR[t]] = (count[PIECE_CHAR[t]] ?? 0) + p.hand(c).count(t)
  for (const [k, n] of Object.entries(count)) if (n > max[k]) flag(where, 'EXCESS', `${k} x${n}`)
  const other = p.color === Color.BLACK ? Color.WHITE : Color.BLACK
  if (p.board.isChecked(other)) flag(where, 'ILLEGAL-POS', 'side not to move is in check')
}

const units = readdirSync(`${ROOT}/data/lessons/units`)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(`${ROOT}/data/lessons/units/${f}`, 'utf8')) as Unit)
  .filter((u) => !ids.length || ids.includes(u.id))
  .sort((a, b) => a.order - b.order)

for (const unit of units) {
  unit.chapters.forEach((ch, c) => {
    const sfen = ch.start === 'startpos' ? STARTPOS : ch.start
    const startPos = Position.newBySFEN(sfen)!
    // every move played anywhere in the chapter, for "mentioned elsewhere" matching
    const all: Played[] = []
    const collect = (p0: Position, steps: Step[]) => {
      const p = Position.newBySFEN(p0.sfen)!
      for (const s of steps) for (const u of s.moves ?? []) {
        const d = describe(p, u)
        if (!d) break
        all.push(d)
        p.doMove(p.createMoveByUSI(u)!)
      }
    }
    collect(startPos, ch.steps)
    const tips: Position[] = []
    {
      const p = Position.newBySFEN(sfen)!
      for (const s of ch.steps) {
        for (const u of s.moves ?? []) p.doMove(p.createMoveByUSI(u)!)
        tips.push(Position.newBySFEN(p.sfen)!)
      }
    }
    ch.variations?.forEach((v) => collect(tips[v.from], [{ moves: v.moves, text: v.text }, ...(v.steps ?? [])]))

    if (ch.kind !== 'opening' && ch.steps[0]?.moves?.length) {
      const learner = ch.side === 'sente' ? Color.BLACK : Color.WHITE
      if (startPos.color !== learner) flag(`${unit.id}#${c}`, 'SIDE', `start side-to-move ${startPos.color === Color.BLACK ? 'sente' : 'gote'} but learner ${ch.side}; first move is opponent's`)
    }

    const run = (p: Position, steps: Step[], label: string, prevLast: string) => {
      let last = prevLast
      steps.forEach((step, n) => {
        const where = `${unit.id}#${c}.${label}${n}`
        const before = Position.newBySFEN(p.sfen)!
        const here: Played[] = []
        for (const u of step.moves ?? []) {
          const d = describe(p, u)
          if (!d) { flag(where, 'ILLEGAL', u); break }
          here.push(d)
          p.doMove(p.createMoveByUSI(u)!)
          last = u
        }
        inventory(p, where)
        const ja = step.text.ja, en = step.text.en
        // notation tokens
        for (const m of ja.matchAll(NOTE)) {
          const [tok, mark, f, r, same, pc, mods] = m
          if (!mark) continue // bare "7六歩" is usually a piece-on-square description; only screen marked moves
          const color = mark === '▲' || mark === '☗' ? Color.BLACK : Color.WHITE
          const piece = pieceKey(pc)
          const promoteWord = /成$/.test(mods) && !/不成$/.test(mods)
          let file = 0, rank = 0
          if (!same) (file = digit(f), rank = KN.indexOf(r) + 1)
          const matches = (d: Played) => {
            if (d.color !== color) return false
            if (!same && (d.file !== file || d.rank !== rank)) return false
            return d.piece === piece || d.pieceAfter === piece
          }
          const inStep = here.filter(matches)
          const anywhere = all.filter(matches)
          // piece already sitting there (description of a placed piece)
          let sitting = false
          if (!same) {
            for (const q of [p, before, startPos]) {
              const at = q.board.at(new Square(file, rank))
              if (at && at.color === color && (PIECE_CHAR[at.type] === piece)) sitting = true
            }
          }
          if (!inStep.length && !anywhere.length && !sitting) {
            // try other colour to detect wrong side marks
            const other = all.filter((d) => d.color !== color && (same || (d.file === file && d.rank === rank)) && (d.piece === piece || d.pieceAfter === piece))
            if (other.length) flag(where, 'SIDE-MARK', `${tok} matches a move by the other side`)
            else if (!same) flag(where, 'UNMATCHED', `${tok} not played in chapter nor a piece there`)
          }
          const pool = inStep.length ? inStep : anywhere
          if (pool.length && !same) {
            const promoted = pool.some((d) => d.promote)
            const unpromoted = pool.some((d) => !d.promote)
            if (promoteWord && !promoted && !pool.some((d) => d.pieceAfter === piece && d.piece !== piece)) flag(where, 'PROMO', `${tok} says 成 but move does not promote`)
            if (/不成/.test(mods) && !unpromoted) flag(where, 'PROMO', `${tok} says 不成 but move promotes`)
            if (!/成/.test(mods) && promoted && !unpromoted && piece === pool[0].piece && !['金', '玉'].includes(piece)) flag(where, 'PROMO', `${tok} omits 成 but move promotes`)
            if (/打/.test(mods) && !pool.some((d) => d.drop)) flag(where, 'DROP', `${tok} says 打 but no drop`)
            if (inStep.length && inStep.every((d) => d.canPromote) && !/成/.test(mods) && !/成/.test(pc)) flag(where, 'NO-FUNARI', `${tok} could promote; formal notation needs 不成`)
          }
        }
        // mate / check claims
        const mate = p.checked && !hasLegalMove(p)
        const claimsMate = /詰み(?!を|ろ|筋|の筋|形|になる形|が見え|狙い|の狙い|ません|ではない|にならない|はない|がない|まで)|詰んで(いる|います|い)/.test(ja) || /\b(is|it's|that's|now) (check)?mate\b|\bcheckmate[d!.]/i.test(en)
        if (mate && !/詰/.test(ja)) flag(where, 'MATE-UNSAID', 'position is checkmate but text does not say 詰')
        if (claimsMate && !mate && here.length) flag(where, 'MATE-CLAIM?', `text suggests mate; position ${p.checked ? 'in check with escapes' : 'not in check'}`)
        if (/^(?:[^。]*?)王手/.test(ja.split('。')[0]) && here.length && !p.checked && !before.checked) flag(where, 'CHECK-CLAIM?', 'first sentence mentions 王手 but no check on board')
        // ja/en square agreement
        const sj = squaresJa(ja), se = squaresEn(en)
        const onlyJa = [...sj].filter((s) => !se.has(s)), onlyEn = [...se].filter((s) => !sj.has(s))
        if (onlyJa.length || onlyEn.length) flag(where, 'JA-EN-SQ', `ja-only ${onlyJa.join(',') || '-'} en-only ${onlyEn.join(',') || '-'}`)
        // marks
        const m = step.marks
        for (const a of [...(m?.arrows ?? []), ...(m?.ghosts ?? [])]) {
          if (a[1] === '*') continue
          if ((step.moves ?? []).includes(a)) continue
          const legalIn = (pos: Position) => {
            const from = Square.newByUSI(a.slice(0, 2))
            const pc = from && pos.board.at(from)
            if (!pc) return false
            const q = Position.newBySFEN(pos.sfen)!
            q.setColor(pc.color)
            const mv = q.createMoveByUSI(a)
            return !!mv && (q.isValidMove(mv) || q.isValidMove(mv.withPromote()))
          }
          if (legalIn(p) || legalIn(before)) continue
          const pcA = p.board.at(Square.newByUSI(a.slice(0, 2))!)
          const pcB = before.board.at(Square.newByUSI(a.slice(0, 2))!)
          if (!pcA && !pcB) flag(where, 'ARROW', `${a} origin empty before and after`)
          // arrows can show a piece's line of attack through to a king; just note
          else flag(where, 'ARROW-NOT-LEGAL', `${a} (${PIECE_CHAR[(pcA ?? pcB)!.type]}) not a legal move for its owner`)
        }
      })
      return last
    }
    const main = Position.newBySFEN(sfen)!
    inventory(main, `${unit.id}#${c}.start`)
    run(main, ch.steps, 's', '')
    ch.variations?.forEach((v, i) => {
      const vp = Position.newBySFEN(tips[v.from].sfen)!
      run(vp, [{ moves: v.moves, text: v.text }, ...(v.steps ?? [])], `v${i}.`, '')
    })
  })
}
writeFileSync(`${OUT}/sem.tsv`, findings.join('\n') + '\n')
const byKind: Record<string, number> = {}
for (const f of findings) byKind[f.split('\t')[1]] = (byKind[f.split('\t')[1]] ?? 0) + 1
console.log(findings.length, byKind)
