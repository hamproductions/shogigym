import { useLayoutEffect, useRef, useState } from 'react'

const RAIL_GAP = 4

export function useRailCapacity() {
  const railRef = useRef<HTMLElement>(null)
  const lastModeRef = useRef<HTMLButtonElement>(null)
  const [capacity, setCapacity] = useState(Infinity)
  useLayoutEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const measure = () => {
      const last = lastModeRef.current
      if (!last) return
      const bottomPadding = parseFloat(getComputedStyle(rail).paddingBottom) || 0
      const free = rail.clientHeight - bottomPadding - (last.offsetTop + last.offsetHeight)
      setCapacity(Math.max(0, Math.floor(free / (last.offsetHeight + RAIL_GAP)) - 1))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(rail)
    return () => observer.disconnect()
  }, [])
  return { railRef, lastModeRef, capacity }
}
