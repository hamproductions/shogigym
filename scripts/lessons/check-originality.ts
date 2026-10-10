import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { overlaps, textsOf } from './originality'

const TARGETS = process.env.TARGETS?.split(',') ?? ['data/lessons/units', 'src/data/joseki', 'vendor/shiryu-joseki/src/data/joseki']

const strings = TARGETS.filter((dir) => existsSync(dir)).flatMap((dir) =>
  readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .flatMap((file) => textsOf(JSON.parse(readFileSync(`${dir}/${file}`, 'utf8')), `${dir}/${file}`)),
)
const findings = overlaps(strings.filter(({ where }) => !/\.source$/.test(where)))
for (const finding of findings) {
  console.log(`${finding.where}  shared ${(finding.share * 100).toFixed(0)}%`)
  for (const run of finding.runs) console.log(`  ${run.length}: ${run.phrase}  <- ${run.doc}`)
}
console.log(`${strings.length} strings checked: ${findings.length} flagged`)
process.exit(findings.length ? 1 : 0)
