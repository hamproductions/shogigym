import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { TaikyokuScene, type Marks } from './scene3d'
import type { BoardHandle } from './TaikyokuBoard'
import type { EngineMove, Pos, Snapshot } from './notation'
import type { TargetKind } from './TaikyokuBoard'

type Props = {
  snap: Snapshot
  selected: Pos | null
  inspected: Pos | null
  targets: Map<string, TargetKind>
  last: EngineMove | null
  onCell: (pos: Pos) => void
  onProgress: (done: number, total: number) => void
}

/** The Taikyoku board on the shared 3D renderer: same tiles, wood, lights and shadows as the shogi board. */
export const TaikyokuBoard3D = forwardRef<BoardHandle, Props>(function TaikyokuBoard3D(props, ref) {
  const host = useRef<HTMLDivElement>(null)
  const scene = useRef<TaikyokuScene | null>(null)
  const latest = useRef(props)
  latest.current = props

  useImperativeHandle(ref, () => ({ fit: () => scene.current?.fit(), focus: (pos, px) => scene.current?.focus(pos, px) }), [])

  useEffect(() => {
    const el = host.current
    if (!el) return
    const s = new TaikyokuScene(el, {
      onCell: (pos) => latest.current.onCell(pos),
      onProgress: (done, total) => latest.current.onProgress(done, total),
    })
    scene.current = s
    s.setPosition(latest.current.snap, latest.current.last)
    s.setMarks(latest.current as Marks)
    return () => {
      s.dispose()
      scene.current = null
    }
  }, [])

  useEffect(() => {
    scene.current?.setPosition(props.snap, props.last)
  }, [props.snap, props.last])

  useEffect(() => {
    scene.current?.setMarks({ selected: props.selected, inspected: props.inspected, targets: props.targets, last: props.last })
  }, [props.selected, props.inspected, props.targets, props.last])

  return <div ref={host} className="tk-canvas tk-3d" role="img" aria-label="Taikyoku shogi board" />
})
