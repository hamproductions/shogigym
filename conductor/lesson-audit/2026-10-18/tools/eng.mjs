// stdin: one SFEN per line. stdout: JSON per line {sfen, score, mate, best, pv}
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
const require = createRequire('/home/user/shogigym/package.json')
const YaneuraOu = require('@mizarjp/yaneuraou.k-p')
const sfens = readFileSync(process.argv[3] ?? 0, 'utf8').split('\n').filter(Boolean)
const movetime = process.argv[2] ?? '1000'
const engine = await YaneuraOu()
let listener = null
engine.addMessageListener((line) => listener?.(line))
const send = (command, terminator, onLine) => new Promise((resolve) => {
  listener = (line) => { onLine?.(line); if (line.startsWith(terminator)) resolve() }
  engine.postMessage(command)
})
await send('usi', 'usiok')
engine.postMessage('setoption name Threads value 1')
engine.postMessage('setoption name USI_Hash value 64')
engine.postMessage('setoption name USI_OwnBook value false')
await send('isready', 'readyok')
for (const sfen of sfens) {
  let score = null, mate = null, best = '', pv = [], depth = 0
  engine.postMessage('usinewgame')
  engine.postMessage(`position sfen ${sfen}`)
  await send(`go movetime ${movetime}`, 'bestmove', (line) => {
    if (!line.startsWith('info') || !/ pv /.test(line) || / lowerbound| upperbound/.test(line)) { if (line.startsWith('bestmove')) best = line.split(' ')[1]; return }
    const cp = / score cp (-?\d+)/.exec(line), m = / score mate (-?\d+)/.exec(line), d = / depth (\d+)/.exec(line)
    if (cp) (score = Number(cp[1]), mate = null)
    else if (m) (mate = Number(m[1]), score = mate > 0 ? 30000 - Math.abs(mate) : -30000 + Math.abs(mate))
    if (d) depth = Number(d[1])
    pv = line.split(' pv ')[1].trim().split(' ')
  })
  console.log(JSON.stringify({ sfen, score, mate, best, depth, pv: pv.slice(0, 10) }))
}
process.exit(0)
