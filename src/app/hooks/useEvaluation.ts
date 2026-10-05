import { useState } from 'react'
import { scoreWinRate } from '@/utils/analysis'
import { scoreToCp } from '@/utils/engine'
import { useAnalysis } from '@/utils/hooks'
import { strip } from '@/utils/book'
import { toSente } from '@/utils/notation'
import { allEvals, rememberEval } from '@/app/memory'
import { useSettings } from '@/appearance/settings'
import type { BoardSession } from './useBoardSession'

type Evals = Record<string, number>

export function useEvaluation({ sfen, ai, toMove }: BoardSession) {
  const settings = useSettings()
  const { analysis, displayed, final } = useAnalysis(sfen, ai, settings.candidates, settings.thinkMs)
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
  return {
    analysis: displayed ?? null,
    best: displayed?.candidates[0],
    evalSente,
    evalFinal: !!final && !!evalSente,
    senteRate: evalSente ? scoreWinRate(evalSente) : 0.5,
    evals,
    recordEval,
    showBest,
    setShowBest,
  }
}

export type Evaluation = ReturnType<typeof useEvaluation>
