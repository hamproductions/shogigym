import { Position } from 'tsshogi'
import { bookMoves } from './book'
import { STARTPOS } from './unit'

const args = process.argv.slice(2)
const plies = Number(args.find((arg) => arg.startsWith('--plies='))?.slice(8) ?? 0)
const start = args.find((arg) => arg.startsWith('--sfen='))?.slice(7) ?? STARTPOS
const moves = args.filter((arg) => !arg.startsWith('--'))

const position = Position.newBySFEN(start)!
const show = (ply: number, played: string) => {
  const entry = bookMoves(position.sfen)
  console.log(
    `${String(ply).padStart(3)} ${played.padEnd(6)} book: ${
      entry
        ? entry
            .slice(0, 5)
            .map(({ usi, ev }) => `${usi} ${ev}`)
            .join(', ')
        : '-'
    }`,
  )
}
moves.forEach((usi, i) => {
  show(i + 1, usi)
  const move = position.createMoveByUSI(usi)
  if (!move || !position.doMove(move)) throw new Error(`Illegal move ${i + 1}: ${usi}`)
})
for (let i = 0; i < plies; i++) {
  const entry = bookMoves(position.sfen)
  if (!entry?.length) break
  show(moves.length + 1, `(${entry[0].usi})`)
  position.doMove(position.createMoveByUSI(entry[0].usi)!)
  moves.push(entry[0].usi)
}
console.log(`line: ${moves.join(' ')}`)
console.log(`sfen: ${position.sfen}`)
