import { useLayoutEffect, useRef } from 'react'

export function useGlide<T extends HTMLElement>(prop: 'height' | 'width', percent: number) {
  const ref = useRef<T>(null)
  const last = useRef(percent)
  useLayoutEffect(() => {
    const from = last.current
    last.current = percent
    if (from === percent) return
    ref.current?.animate([{ [prop]: `${from}%` }, { [prop]: `${percent}%` }], { duration: 700, easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)' })
  }, [prop, percent])
  return ref
}
