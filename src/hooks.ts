import { useEffect, useState, useSyncExternalStore } from 'react'
import { analyze, engineSupported, type Analysis } from './engine'
import { usiPosition } from './analysis'
import { allCards, subscribe } from './srs'

export function useAnalysis(sfen: string, enabled: boolean, multipv = 3, movetime = 1500) {
  const [state, setState] = useState<{ sfen: string; analysis: Analysis | null; error: string | null }>({ sfen: '', analysis: null, error: null })
  useEffect(() => {
    if (!enabled || !engineSupported()) return
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const quick = await analyze(usiPosition(sfen), { multipv, movetime: 300 })
        if (cancelled) return
        setState({ sfen, analysis: quick, error: null })
        const deep = await analyze(usiPosition(sfen), { multipv, movetime, background: true })
        if (!cancelled && deep.candidates.length) setState({ sfen, analysis: deep, error: null })
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

let cardsSnapshot = allCards()
subscribe(() => {
  cardsSnapshot = allCards()
})

export function useCards() {
  return useSyncExternalStore(subscribe, () => cardsSnapshot)
}

export function useHashRoute(): string[] {
  const read = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent)
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const onChange = () => setRoute(read())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export const go = (...parts: string[]) => {
  window.location.hash = '/' + parts.map(encodeURIComponent).join('/')
}
