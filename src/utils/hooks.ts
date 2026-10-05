import { useEffect, useState } from 'react'
import { analyze, engineSupported, useEngineStatus, type Analysis } from './engine'
import { usiPosition } from './analysis'

const settled = new Map<string, Analysis>()

export function useAnalysis(sfen: string, enabled: boolean, multipv = 3, movetime = 1500) {
  const { epoch } = useEngineStatus()
  const [state, setState] = useState<{ sfen: string; analysis: Analysis | null; displayed?: Analysis; error: string | null; final?: boolean }>({
    sfen: '',
    analysis: null,
    error: null,
  })
  useEffect(() => {
    if (!enabled || !engineSupported()) return
    let cancelled = false
    const key = `${epoch}|${sfen}|${multipv}|${movetime}`
    const known = settled.get(key)
    if (known) {
      queueMicrotask(() => !cancelled && setState({ sfen, analysis: known, displayed: known, error: null, final: true }))
      return () => {
        cancelled = true
      }
    }
    const timer = setTimeout(async () => {
      try {
        const onUpdate = (analysis: Analysis) => {
          if (!cancelled)
            setState((previous) => ({ sfen, analysis, displayed: previous.sfen === sfen ? (previous.displayed ?? analysis) : analysis, error: null }))
        }
        const quick = await analyze(usiPosition(sfen), { multipv, movetime: 300, onUpdate })
        if (cancelled) return
        setState((previous) => ({ sfen, analysis: quick, displayed: quick.candidates.length ? quick : previous.displayed, error: null }))
        const deep = await analyze(usiPosition(sfen), { multipv, movetime, background: true, onUpdate })
        if (deep.candidates.length) {
          settled.set(key, deep)
          if (settled.size > 500) settled.delete(settled.keys().next().value!)
          if (!cancelled) setState({ sfen, analysis: deep, displayed: deep, error: null, final: true })
        }
      } catch (e) {
        if (!cancelled) setState({ sfen, analysis: null, error: (e as Error).message })
      }
    }, 30)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [sfen, enabled, multipv, movetime, epoch])
  return state.sfen === sfen ? state : { sfen, analysis: null, error: null }
}
