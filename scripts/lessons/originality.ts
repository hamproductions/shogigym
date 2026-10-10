import { existsSync, readFileSync, readdirSync } from 'node:fs'

const CORPUS = ['.cache/curriculum-source', '.cache/reference']
const OLD_POSITIONS = ['.cache/old/lessons/figures', '.cache/old/joseki']
const GRAM = 10

const MOVE = /[▲△☗☖]?(?:[1-9１-９][一二三四五六七八九]|同\s?)(?:成?[玉王飛角金銀桂香歩竜龍馬と]|成[銀桂香])(?:[右左直上寄引行入打]|成|不成)*/g
export const normalize = (text: string) =>
  text
    .normalize('NFKC')
    .replace(MOVE, '')
    .replace(/[^\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー]/gu, '')

export type Finding = { where: string; share: number; runs: { length: number; doc: string; phrase: string }[] }

export function corpus() {
  if (!CORPUS.some((dir) => existsSync(dir))) throw new Error('No reference corpus in .cache; see docs/lessons.md')
  const docs = CORPUS.filter((dir) => existsSync(dir)).flatMap((dir) =>
    readdirSync(dir)
      .filter((file) => file.endsWith('.txt'))
      .map((file) => {
        const lines = readFileSync(`${dir}/${file}`, 'utf8').split('\n')
        return { name: lines.find((line) => line.startsWith('http')) ?? file, text: normalize(lines.join('\n')) }
      }),
  )
  const index = new Map<string, [number, number][]>()
  docs.forEach(({ text }, doc) => {
    for (let i = 0; i + GRAM <= text.length; i++) {
      const gram = text.slice(i, i + GRAM)
      const list = index.get(gram)
      if (!list) index.set(gram, [[doc, i]])
      else if (list.length < 64) list.push([doc, i])
    }
  })
  return { docs, index }
}

export function overlaps(strings: { where: string; text: string }[], report = 16): Finding[] {
  const { docs, index } = corpus()
  const findings: Finding[] = []
  for (const { where, text } of strings) {
    const target = normalize(text)
    let covered = 0
    let i = 0
    const runs: Finding['runs'] = []
    while (i + GRAM <= target.length) {
      let best = 0
      let bestDoc = -1
      for (const [doc, pos] of index.get(target.slice(i, i + GRAM)) ?? []) {
        let length = GRAM
        while (i + length < target.length && docs[doc].text[pos + length] === target[i + length]) length++
        if (length > best) [best, bestDoc] = [length, doc]
      }
      if (best) {
        covered += best
        if (best >= report) runs.push({ length: best, doc: docs[bestDoc].name, phrase: target.slice(i, i + best) })
        i += best
      } else i++
    }
    const share = target.length ? covered / target.length : 0
    if (runs.length || (target.length >= 40 && share > 0.25)) findings.push({ where, share, runs })
  }
  return findings
}

export const boardKey = (sfen: string) => sfen.split(' ').slice(0, 3).join(' ')
export const material = (sfen: string) => {
  const [board, , hands] = sfen.split(' ')
  const onBoard = board.replace(/[^a-zA-Z]/g, '').length
  const inHand = hands === '-' ? 0 : [...hands.matchAll(/(\d*)[a-zA-Z]/g)].reduce((sum, [, n]) => sum + (n ? Number(n) : 1), 0)
  return onBoard + inHand
}

export function oldPositions() {
  const old = new Map<string, string>()
  const remember = (value: unknown, where: string) => {
    if (Array.isArray(value)) value.forEach((item) => remember(item, where))
    else if (value && typeof value === 'object')
      for (const [key, item] of Object.entries(value)) {
        if ((key === 'sfen' || key === 'start') && typeof item === 'string' && item.includes('/')) old.set(boardKey(item), where)
        else remember(item, where)
      }
  }
  for (const dir of OLD_POSITIONS.filter((dir) => existsSync(dir)))
    for (const file of readdirSync(dir).filter((file) => file.endsWith('.json'))) remember(JSON.parse(readFileSync(`${dir}/${file}`, 'utf8')), `${dir}/${file}`)
  return old
}

export const SKIP_KEYS = ['en', 'commentEn', 'noteEn', 'titleEn', 'url', 'sfen', 'start', 'usi', 'moves', 'marks', 'license', 'references']
export function textsOf(value: unknown, where: string, out: { where: string; text: string }[] = []) {
  if (typeof value === 'string') out.push({ where, text: value })
  else if (Array.isArray(value)) value.forEach((item, i) => textsOf(item, `${where}[${i}]`, out))
  else if (value && typeof value === 'object')
    for (const [key, item] of Object.entries(value)) if (!SKIP_KEYS.includes(key)) textsOf(item, `${where}.${key}`, out)
  return out
}
