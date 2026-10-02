import { useState } from 'react'
import { scoreWinRate } from '../../analysis'
import { scoreToCp } from '../../engine'
import { useAnalysis } from '../../hooks'
import { strip } from '../lib/book'
import { toSente } from '../lib/notation'
import { allEvals, rememberEval } from '../memory'
import { useSettings } from '../settings'
import type { BoardSession } from './useBoardSession'

type Evals = Record<string, number>

export function useEvaluation({ sfen, ai, toMove }: BoardSession) {
  const settings = useSettings()
  const { analysis } = useAnalysis(sfen, ai, settings.candidates, settings.thinkMs)
  const [evals, setEvalsState] = useState<Evals>(allEvals)
  const [showBest, setShowBest] = useState(true)
  const best = analysis?.candidates[0]
  const evalSente = ai && best ? toSente(best.score, toMove) : null
  const evalKey = strip(sfen)
  const evalCp = evalSente ? scoreToCp(evalSente) : null
  const updateEvals = (f: (e: Evals) => Evals) =>
    setEvalsState((e) => {
      const next = f(e)
      for (const k of Object.keys(next)) if (next[k] !== e[k]) rememberEval(k, next[k])
      return next
    })
  const recordEval = (key: string, cp: number) => updateEvals((e) => ({ ...e, [key]: cp }))
  const [seen, setSeen] = useState({ evalKey, evalCp })
  if (seen.evalKey !== evalKey || seen.evalCp !== evalCp) {
    setSeen({ evalKey, evalCp })
    if (evalCp !== null) updateEvals((e) => (e[evalKey] === evalCp ? e : { ...e, [evalKey]: evalCp }))
  }
  return { analysis, best, evalSente, senteRate: evalSente ? scoreWinRate(evalSente) : 0.5, evals, recordEval, showBest, setShowBest }
}

export type Evaluation = ReturnType<typeof useEvaluation>
