import { useEffect, useState } from 'react'
import { analyze, engineSupported, type Analysis } from './engine'
import { usiPosition } from './analysis'

const settled = new Map<string, Analysis>()

export function useAnalysis(sfen: string, enabled: boolean, multipv = 3, movetime = 1500) {
  const [state, setState] = useState<{ sfen: string; analysis: Analysis | null; error: string | null }>({ sfen: '', analysis: null, error: null })
  useEffect(() => {
    if (!enabled || !engineSupported()) return
    let cancelled = false
    const key = `${sfen}|${multipv}|${movetime}`
    const known = settled.get(key)
    if (known) {
      queueMicrotask(() => !cancelled && setState({ sfen, analysis: known, error: null }))
      return () => {
        cancelled = true
      }
    }
    const timer = setTimeout(async () => {
      try {
        const quick = await analyze(usiPosition(sfen), { multipv, movetime: 300 })
        if (cancelled) return
        setState({ sfen, analysis: quick, error: null })
        const deep = await analyze(usiPosition(sfen), { multipv, movetime, background: true })
        if (deep.candidates.length) {
          settled.set(key, deep)
          if (settled.size > 500) settled.delete(settled.keys().next().value!)
          if (!cancelled) setState({ sfen, analysis: deep, error: null })
        }
      } catch (e) {
        if (!cancelled) setState({ sfen, analysis: null, error: (e as Error).message })
      }
    }, 30)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [sfen, enabled, multipv, movetime])
  return state.sfen === sfen ? state : { sfen, analysis: null, error: null }
}
