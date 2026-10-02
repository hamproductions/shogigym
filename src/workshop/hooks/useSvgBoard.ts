import { useEffect, useRef } from 'react'
import type { ImmutablePosition } from 'tsshogi'
import { flushMoveSound, moveSound, soundPending } from '../avatars'
import type { Board3DProps } from '../Board3D'
import { SNAPSHOT_EVENT, SNAPSHOT_NAME } from '../lib/events'
import { steppedMove } from '../lib/stepped'

export function useSvgBoard(props: Pick<Board3DProps, 'position' | 'lastMove'>) {
  const previous = useRef<ImmutablePosition | null>(null)
  useEffect(() => {
    const prev = previous.current
    previous.current = props.position
    if (!prev || prev.sfen === props.position.sfen) return
    const stepped = steppedMove(prev, props.position, props.lastMove)
    if (stepped && !soundPending()) moveSound(stepped.capture ? 'capture' : 'move')
    flushMoveSound()
  }, [props.position, props.lastMove])
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
