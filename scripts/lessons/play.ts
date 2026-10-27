import { Position } from 'tsshogi'
import { STARTPOS } from './unit'
const args = process.argv.slice(2)
const start = args.find((a) => a.startsWith('--sfen='))?.slice(7) ?? STARTPOS
const target = args.find((a) => a.startsWith('--target='))?.slice(9)
const p = Position.newBySFEN(start)!
args
  .filter((a) => !a.startsWith('--'))
  .forEach((usi, i) => {
    const m = p.createMoveByUSI(usi)
    if (!m || !p.isValidMove(m)) throw new Error(`illegal ${i + 1}: ${usi} in ${p.sfen}`)
    p.doMove(m)
  })
console.log(p.sfen)
if (target) console.log(p.sfen.split(' ').slice(0, 3).join(' ') === target ? 'MATCH' : `DIFF target ${target}`)
