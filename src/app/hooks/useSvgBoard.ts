import { useEffect, useRef } from 'react'
import { SNAPSHOT_EVENT, SNAPSHOT_NAME } from '@/utils/events'

export function useSvgBoard() {
  const svgRef = useRef<SVGSVGElement>(null)
  useEffect(() => {
    const pending = new AbortController()
    const onSnapshot = (event: Event) => {
      const svg = svgRef.current
      if (!svg) return
      const box = svg.viewBox.baseVal
      const img = new Image()
      img.addEventListener(
        'load',
        () => {
          const canvas = document.createElement('canvas')
          canvas.width = box.width
          canvas.height = box.height
          canvas.getContext('2d')!.drawImage(img, 0, 0)
          const a = document.createElement('a')
          a.href = canvas.toDataURL('image/png')
          a.download = `${(event as CustomEvent<string>).detail || SNAPSHOT_NAME}.png`
          a.click()
        },
        { once: true, signal: pending.signal },
      )
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`
    }
    globalThis.addEventListener(SNAPSHOT_EVENT, onSnapshot)
    return () => {
      pending.abort()
      globalThis.removeEventListener(SNAPSHOT_EVENT, onSnapshot)
    }
  }, [])
  return svgRef
}
