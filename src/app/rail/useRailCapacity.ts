import { useLayoutEffect, useRef, useState } from 'react'

const RAIL_GAP = 4

export function useRailCapacity(compact: boolean) {
  const railRef = useRef<HTMLElement>(null)
  const lastModeRef = useRef<HTMLButtonElement>(null)
  const [capacity, setCapacity] = useState(Infinity)
  useLayoutEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const measure = () => {
      const last = lastModeRef.current
      if (!last) return
      const style = getComputedStyle(rail)
      const horizontal = style.flexDirection === 'row'
      const bounds = rail.getBoundingClientRect()
      const anchor = last.getBoundingClientRect()
      const padding = parseFloat(horizontal ? style.paddingRight : style.paddingBottom) || 0
      const free = horizontal ? bounds.right - anchor.right - padding : bounds.bottom - anchor.bottom - padding
      const size = horizontal ? 44 : last.offsetHeight
      const gap = parseFloat(style.gap) || RAIL_GAP
      setCapacity(Math.max(0, Math.floor(free / (size + gap)) - 1))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(rail)
    return () => observer.disconnect()
  }, [compact])
  return { railRef, lastModeRef, capacity }
}
