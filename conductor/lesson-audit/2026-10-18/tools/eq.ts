import { readFileSync, readdirSync } from 'node:fs'
import { lessonOf, type Unit } from '/home/user/shogigym/scripts/lessons/unit'
let bad = 0, n = 0
const files = readdirSync('data/lessons/units').filter(f => f.endsWith('.json'))
for (const f of files) {
  const u = JSON.parse(readFileSync(`data/lessons/units/${f}`, 'utf8')) as Unit
  n++
  if (u.id + '.json' !== f) console.log('ID MISMATCH', f, u.id)
  let out = ''
  try { out = readFileSync(`src/data/lessons/${u.id}.json`, 'utf8') } catch { console.log('MISSING OUTPUT', u.id); bad++; continue }
  if (JSON.stringify(lessonOf(u)) !== out) { console.log('STALE', u.id); bad++ }
}
const outs = readdirSync('src/data/lessons').filter(f => f.endsWith('.json'))
for (const o of outs) if (!files.includes(o)) console.log('ORPHAN OUTPUT', o)
console.log(n, 'units', bad, 'stale/missing', outs.length, 'outputs')
