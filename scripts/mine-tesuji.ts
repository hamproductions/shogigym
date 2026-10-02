import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { detectTesuji } from '../src/workshop/tesuji'
import { applyUsi } from '../src/shogi'

type Node = { sfen: string; branches: { usi: string; kind: string; note?: string; child?: Node }[] }
type Drill = { id: string; tesuji: string; en: string; explain: string; sfen: string; answer: string; from: string; note?: string }

const out: Drill[] = []
const seen = new Set<string>()
const add = (d: Drill) => {
  const key = `${d.sfen.split(' ').slice(0, 3).join(' ')}|${d.answer}`
  if (seen.has(key)) return
  seen.add(key)
  out.push(d)
}

for (const dir of ['src/data/joseki', 'vendor/shiryu-joseki/src/data/joseki']) {
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const course = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'))
    if (String(course.id).startsWith('tesuji--')) continue
    const walk = (n: Node) => {
      for (const b of n.branches) {
        if (b.kind !== 'deviation') {
          const t = detectTesuji(n.sfen, b.usi)
          if (t) add({ id: `book-${out.length}`, tesuji: t.ja, en: t.en, explain: t.explain, sfen: n.sfen, answer: b.usi, from: course.title, note: b.note })
        }
        if (b.child) walk(b.child)
      }
    }
    walk(course.root)
  }
}

const tsume = JSON.parse(readFileSync('src/data/tsume.json', 'utf8')) as { id: string; mate: number; sfen: string; pv: string[] }[]
for (const p of tsume) {
  let sfen = p.sfen
  p.pv.forEach((usi, i) => {
    if (i % 2 === 0) {
      const t = detectTesuji(sfen, usi)
      if (t && ['頭金', '腹銀', '割り打ちの銀', '垂れ歩', '叩きの歩', '焦点の歩', '底歩', '合わせの歩', '両王手', '空き王手', '尻金', '肩銀', '一間竜', '吊るし桂', '捨て駒の王手'].includes(t.ja)) add({ id: `tsume-${p.id}-${i}`, tesuji: t.ja, en: t.en, explain: t.explain, sfen, answer: usi, from: `詰将棋 ${p.mate}手詰 #${p.id}` })
    }
    sfen = applyUsi(sfen, usi) ?? sfen
  })
}

let seed = 7
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const byKind = new Map<string, Drill[]>()
for (const d of out) byKind.set(d.tesuji, [...(byKind.get(d.tesuji) ?? []), d])
const capped = [...byKind.values()].flatMap((list) => {
  const book = list.filter((d) => d.id.startsWith('book-'))
  const rest = list.filter((d) => !d.id.startsWith('book-')).sort(() => rand() - 0.5)
  return [...book, ...rest].slice(0, Math.max(150, book.length))
})
out.length = 0
out.push(...capped)
writeFileSync('src/data/tesuji-drills.json', JSON.stringify(out))
const counts: Record<string, number> = {}
for (const d of out) counts[d.tesuji] = (counts[d.tesuji] ?? 0) + 1
console.log(out.length, counts)
