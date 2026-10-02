import { useEffect, useRef } from 'react'
import type { ImmutablePosition } from 'tsshogi'
import { updateView } from './board3d/camera'
import { setBoardDims } from './board3d/dimensions'
import { flipCameraOffset, saveSnapshot, startTableFlip, stepTableFlip } from './board3d/effects'
import { bindPointer } from './board3d/interaction'
import { layout, sideStandsFit, zoneReporter } from './board3d/layout'
import { drawMarks } from './board3d/marks'
import { liftSelected, rebuild, stepAnimations } from './board3d/pieces'
import { buildScene, createRenderer } from './board3d/scene'
import { clearFaceTextures } from './board3d/textures'
import type { Board3DProps, SceneState } from './board3d/types'
import { SNAPSHOT_EVENT, TABLE_FLIP_EVENT } from './lib/events'

export type { Board3DProps, BoardArrow, StandZones, ZoneRect } from './board3d/types'

export function Board3D(props: Board3DProps) {
  setBoardDims()
  const host = useRef<HTMLDivElement>(null)
  const state = useRef<SceneState | null>(null)
  const latest = useRef(props)
  latest.current = props
  const previous = useRef<ImmutablePosition | null>(null)

  useEffect(() => {
    const el = host.current!
    const renderer = createRenderer()
    el.appendChild(renderer.domElement)
    const s = buildScene(renderer)
    state.current = s
    const refresh = (animate = false) => rebuild(s, latest.current, animate)

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el
      renderer.setSize(w, h)
      s.camera.aspect = w / h
      s.camera.updateProjectionMatrix()
      const narrow = w < 560
      const portrait = !sideStandsFit(w, h)
      if (portrait === layout.portrait && narrow === layout.narrow) return
      layout.portrait = portrait
      layout.narrow = narrow
      s.placeStands()
      refresh()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    resize()

    const unbind = bindPointer(s, latest, refresh)
    const cancelPrefetch = s.room.prefetch()
    const reportZones = zoneReporter(s, latest)

    let frame = 0
    const loop = (time: number) => {
      const dt = Math.min(0.5, (time - (s.lastTime ?? time)) / 1000)
      s.lastTime = time
      if (s.tiltTarget > 0 || latest.current.orbit || s.flip) s.room.need()
      updateView(s, latest.current, dt)
      liftSelected(s, latest.current, dt)
      stepTableFlip(s, time, dt, refresh)
      stepAnimations(s, time)
      const shake = flipCameraOffset(s, time)
      if (shake) s.camera.position.add(shake)
      renderer.render(s.scene, s.camera)
      if (shake) s.camera.position.sub(shake)
      if (!performance.getEntriesByName('board-first-frame').length) performance.mark('board-first-frame')
      reportZones()
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    const onFlip = () => startTableFlip(s)
    const onSnapshot = (event: Event) => saveSnapshot(s, (event as CustomEvent<string>).detail)
    window.addEventListener(TABLE_FLIP_EVENT, onFlip)
    window.addEventListener(SNAPSHOT_EVENT, onSnapshot)

    document.fonts.load('800 64px "Shippori Mincho B1"').then(() => {
      clearFaceTextures()
      refresh()
    })

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener(TABLE_FLIP_EVENT, onFlip)
      window.removeEventListener(SNAPSHOT_EVENT, onSnapshot)
      unbind()
      cancelPrefetch()
      observer.disconnect()
      s.controls?.dispose()
      renderer.dispose()
      el.removeChild(renderer.domElement)
      state.current = null
    }
  }, [])

  useEffect(() => {
    const prev = previous.current
    previous.current = props.position
    const s = state.current
    if (s) rebuild(s, latest.current, prev !== null && prev.sfen !== props.position.sfen && performance.now() - (s.droppedAt ?? 0) > 400)
  }, [props.position])

  useEffect(() => {
    if (state.current) drawMarks(state.current, latest.current)
  }, [props.selected, props.targets, props.arrows, props.lastMove, props.castles, props.stamp, props.flipped, props.peek, props.peekFrom, props.checkSquare, props.heat])

  useEffect(() => {
    if (state.current) state.current.tiltTarget = props.tilted ? 1 : 0
  }, [props.tilted])

  useEffect(() => {
    if (state.current) state.current.settled = false
  }, [props.snapKey])

  return <div className="board3d" ref={host} />
}
