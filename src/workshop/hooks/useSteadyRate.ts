import { useEffect, useRef, useState } from 'react'

export function useSteadyRate(rate: number | null) {
  const [shown, setShown] = useState<number | null>(rate)
  const committed = useRef(0)
  useEffect(() => {
    if (rate === null) return
    const wait = Math.max(0, 450 - (performance.now() - committed.current))
    const id = window.setTimeout(() => {
      committed.current = performance.now()
      setShown((s) => (s !== null && Math.abs(s - rate) < 0.01 ? s : rate))
    }, wait)
    return () => window.clearTimeout(id)
  }, [rate])
  return shown
}
