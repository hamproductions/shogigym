import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { TaikyokuScene, type Marks, type TaikyokuArrow } from './scene3d'
import { useSettings } from '@/appearance/settings'
import type { BoardHandle } from './TaikyokuBoard'
import type { EngineMove, Pos, Snapshot } from './notation'
import type { CaptureEntry } from './useTaikyoku'
import type { StandZones } from '@/rendering/board3d/types'
import type { TargetKind } from './TaikyokuBoard'

type Props = {
  snap: Snapshot
  selected: Pos | null
  inspected: Pos | null
  targets: Map<string, TargetKind>
  control?: Map<string, { b: Pos[]; w: Pos[] }>
  showControl?: boolean
  arrows?: TaikyokuArrow[]
  peekTargets?: Pos[]
  captures?: CaptureEntry[]
  last: EngineMove | null
  animate?: boolean
  sideRoom?: number
  onZones?: (zones: StandZones | null) => void
  onCell: (pos: Pos) => void
  onProgress: (done: number, total: number) => void
}

/** The Taikyoku board on the shared 3D renderer: same tiles, wood, lights and shadows as the shogi board. */
export const TaikyokuBoard3D = forwardRef<BoardHandle, Props>(function TaikyokuBoard3D(props, ref) {
  const settings = useSettings()
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
      onZones: (zones) => latest.current.onZones?.(zones),
    })
    scene.current = s
    s.setSideRoom(latest.current.sideRoom ?? 0)
    s.setPosition(latest.current.snap, null)
    s.setMarks(latest.current as Marks)
    s.setCaptures(latest.current.captures ?? [], false)
    return () => {
      s.dispose()
      scene.current = null
      latest.current.onZones?.(null)
    }
  }, [])

  useEffect(() => {
    scene.current?.setCaptures(props.captures ?? [], !!props.animate)
    scene.current?.setPosition(props.snap, props.animate ? props.last : null)
  }, [props.snap, props.last, props.animate, props.captures])

  useEffect(() => {
    scene.current?.setMarks({
      selected: props.selected,
      inspected: props.inspected,
      targets: props.targets,
      last: props.last,
      control: props.control,
      showControl: props.showControl,
      arrows: props.arrows,
      peekTargets: props.peekTargets,
    })
  }, [props.selected, props.inspected, props.targets, props.last, props.control, props.showControl, props.arrows, props.peekTargets])

  useEffect(() => {
    scene.current?.setSideRoom(props.sideRoom ?? 0)
  }, [props.sideRoom])

  useEffect(() => {
    scene.current?.syncAppearance()
  }, [settings])

  return <div ref={host} className="tk-canvas tk-3d" tabIndex={0} role="img" aria-label="Taikyoku shogi board" />
})
