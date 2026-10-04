import { useEffect, useRef } from 'react'
import { SNAPSHOT_EVENT, SNAPSHOT_NAME } from '../lib/events'

export function useSvgBoard() {
  const svgRef = useRef<SVGSVGElement>(null)
  useEffect(() => {
    const onSnapshot = (event: Event) => {
      const svg = svgRef.current
      if (!svg) return
      const box = svg.viewBox.baseVal
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = box.width
        canvas.height = box.height
        canvas.getContext('2d')!.drawImage(img, 0, 0)
        const a = document.createElement('a')
        a.href = canvas.toDataURL('image/png')
        a.download = `${(event as CustomEvent<string>).detail || SNAPSHOT_NAME}.png`
        a.click()
      }
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`
    }
    window.addEventListener(SNAPSHOT_EVENT, onSnapshot)
    return () => window.removeEventListener(SNAPSHOT_EVENT, onSnapshot)
  }, [])
  return svgRef
}
