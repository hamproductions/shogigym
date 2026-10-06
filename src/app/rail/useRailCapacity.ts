import { useCallback, useLayoutEffect, useRef, useState } from 'react'

const RAIL_GAP = 4

export function useRailCapacity() {
  const railRef = useRef<HTMLElement>(null)
  const anchorRef = useRef<HTMLButtonElement | null>(null)
  const [capacity, setCapacity] = useState(Infinity)
  const measure = useCallback(() => {
    const rail = railRef.current
    const last = anchorRef.current
    if (!rail || !last) return
    const style = getComputedStyle(rail)
    const horizontal = style.flexDirection === 'row'
    const bounds = rail.getBoundingClientRect()
    const anchor = last.getBoundingClientRect()
    const padding = parseFloat(horizontal ? style.paddingRight : style.paddingBottom) || 0
    const free = horizontal ? bounds.right - anchor.right - padding : bounds.bottom - anchor.bottom - padding
    const size = horizontal ? 44 : last.offsetHeight
    const gap = parseFloat(style.gap) || RAIL_GAP
    setCapacity(Math.max(0, Math.floor(free / (size + gap)) - 1))
  }, [])
  // The measured anchor is a different button when the rail switches between the full and compact layouts, so re-measure whenever it changes.
  const lastModeRef = useCallback(
    (element: HTMLButtonElement | null) => {
      anchorRef.current = element
      if (element) measure()
    },
    [measure],
  )
  useLayoutEffect(() => {
    const rail = railRef.current
    if (!rail) return
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(rail)
    return () => observer.disconnect()
  }, [measure])
  return { railRef, lastModeRef, capacity }
}
