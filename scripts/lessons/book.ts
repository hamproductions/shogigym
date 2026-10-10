import { readFileSync, readdirSync } from 'node:fs'
import { bookPosition, flipBookMove } from '../../src/utils/bookPosition'

const DIR = 'public/books/peta233-v1'
const entries = new Map<string, [string, number, number][]>()
for (const file of readdirSync(DIR).filter((f) => /^[0-9a-f]{2}\.json$/.test(f)))
  for (const [key, moves] of Object.entries(JSON.parse(readFileSync(`${DIR}/${file}`, 'utf8')))) entries.set(key, moves as [string, number, number][])

export function bookMoves(sfen: string) {
  const { key, flipped } = bookPosition(sfen)
  return entries.get(key)?.map(([usi, ev]) => ({ usi: flipped ? flipBookMove(usi) : usi, ev }))
}
