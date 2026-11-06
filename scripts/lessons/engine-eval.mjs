import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'

const require = createRequire(import.meta.url)
const YaneuraOu = require('@mizarjp/yaneuraou.k-p')
const sfens = readFileSync(0, 'utf8').split('\n').filter(Boolean)
const movetime = process.argv[2] ?? '400'
const withPv = process.argv.includes('--pv')

const engine = await YaneuraOu()
let listener = null
engine.addMessageListener((line) => listener?.(line))
const send = (command, terminator, onLine) =>
  new Promise((resolve) => {
    listener = (line) => {
      onLine?.(line)
      if (line.startsWith(terminator)) resolve()
    }
    engine.postMessage(command)
  })

await send('usi', 'usiok')
engine.postMessage('setoption name Threads value 1')
engine.postMessage('setoption name USI_Hash value 32')
engine.postMessage('setoption name USI_OwnBook value false')
await send('isready', 'readyok')
for (const sfen of sfens) {
  let score
  let best = ''
  let mateIn = '-'
  let pv = ''
  engine.postMessage(`position sfen ${sfen}`)
  await send(`go movetime ${movetime}`, 'bestmove', (line) => {
    const cp = / score cp (-?\d+)/.exec(line)
    const mate = / score mate (-?\d+)/.exec(line)
    if (cp) {
      score = Number(cp[1])
      mateIn = '-'
    } else if (mate) {
      score = Number(mate[1]) > 0 ? 30000 : -30000
      mateIn = mate[1]
    }
    const principal = / pv (.+)$/.exec(line)
    if (principal) pv = principal[1]
    if (line.startsWith('bestmove')) best = line.split(' ')[1]
  })
  if (!Number.isFinite(score) || !best) throw new Error(`engine did not return a score and bestmove for ${sfen}`)
  console.log(`${score} ${best} ${mateIn}${withPv && pv ? ` ${pv}` : ''}`)
}
process.exit(0)
