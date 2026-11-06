import { execFileSync } from 'node:child_process'
import { Position } from 'tsshogi'

type Evaluation = { score: number; best: string; pv: string[] }
const cache = new Map<string, Evaluation>()

export function evaluate(sfens: string[]): Evaluation[] {
  const missing = [...new Set(sfens.filter((sfen) => !cache.has(sfen)))]
  if (missing.length) {
    const rows = execFileSync('node', ['scripts/lessons/engine-eval.mjs', '400', '--pv'], {
      input: missing.join('\n'),
      encoding: 'utf8',
      timeout: 600000,
    })
      .trim()
      .split('\n')
    if (rows.length !== missing.length) throw new Error(`engine returned ${rows.length} scores for ${missing.length} positions`)
    rows.forEach((row, i) => {
      const [score, best, _mate, ...principal] = row.split(' ')
      if (!Number.isFinite(Number(score)) || !best) throw new Error(`invalid engine result: ${row}`)
      const position = Position.newBySFEN(missing[i])!
      const pv: string[] = []
      if (principal[0] === best)
        for (const usi of principal) {
          const move = position.createMoveByUSI(usi)
          if (!move || move.usi !== usi || !position.isValidMove(move) || !position.doMove(move)) break
          pv.push(usi)
        }
      cache.set(missing[i], { score: Number(score), best, pv })
    })
  }
  return sfens.map((sfen) => cache.get(sfen)!)
}
