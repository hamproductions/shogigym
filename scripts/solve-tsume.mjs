import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const require = createRequire(import.meta.url)
const YaneuraOu = require('@mizarjp/yaneuraou.k-p')

const [mateLength, limit = '400', movetime = '400'] = process.argv.slice(2)
const input = `data/tsume-raw/mate${mateLength}.sfen`
const output = 'src/data/tsume.json'

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
engine.postMessage('setoption name Threads value 2')
engine.postMessage('setoption name USI_Hash value 64')
engine.postMessage('setoption name USI_OwnBook value false')
await send('isready', 'readyok')

const existing = existsSync(output) ? JSON.parse(readFileSync(output, 'utf8')) : []
const known = new Set(existing.map((p) => p.sfen))
const sfens = readFileSync(input, 'utf8').split('\n').filter(Boolean).slice(0, Number(limit))
const solved = []

for (const [i, sfen] of sfens.entries()) {
  if (known.has(sfen)) continue
  let last = null
  engine.postMessage('usinewgame')
  engine.postMessage(`position sfen ${sfen}`)
  await send(`go movetime ${movetime}`, 'bestmove', (line) => {
    if (line.startsWith('info') && line.includes(' pv ')) last = line
  })
  const match = last?.match(/score mate (\d+).* pv (.*)$/)
  if (match && Number(match[1]) === Number(mateLength)) {
    const pv = match[2].trim().split(' ')
    if (pv.length === Number(mateLength)) solved.push({ id: `m${mateLength}-${i + 1}`, mate: Number(mateLength), sfen, pv })
  }
  if ((i + 1) % 50 === 0) console.log(`${i + 1}/${sfens.length} checked, ${solved.length} confirmed`)
}

writeFileSync(output, `${JSON.stringify([...existing, ...solved])}\n`)
console.log(`mate${mateLength}: ${solved.length} confirmed of ${sfens.length}`)
engine.terminate()
process.exit(0)
