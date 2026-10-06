import './board.css'
import { useEffect, useRef, useState } from 'react'
import { BoardLoading } from './BoardLoading'
import { Color, type ImmutablePosition } from 'tsshogi'
import { avatarSlot } from './avatars'
import { updateView } from '@/rendering/board3d/camera'
import { HALF_D, HALF_W, LEG, THICK, setBoardDims } from '@/rendering/board3d/dimensions'
import { flipCameraOffset, resetTableFlip, saveSnapshot, startTableFlip, stepTableFlip } from '@/rendering/board3d/effects'
import { createFurigoma3D } from '@/rendering/board3d/furigoma'
import { bindPointer } from '@/rendering/board3d/interaction'
import { layout, sideStandsFit, zoneReporter } from '@/rendering/board3d/layout'
import { drawMarks } from '@/rendering/board3d/marks'
import { liftSelected, rebuild, stepAnimations } from '@/rendering/board3d/pieces'
import { createPower, moveEvent, type Power } from '@/rendering/board3d/power'
import { buildScene, createRenderer, disposeRenderer } from '@/rendering/board3d/scene'
import { clearFaceTextures } from '@/rendering/board3d/textures'
import type { Board3DProps, SceneState } from '@/rendering/board3d/types'
import { SNAPSHOT_EVENT, TABLE_FLIP_EVENT } from '@/utils/events'
import { getSettings, playSound, subscribeSettings } from '@/appearance/settings'

export type { Board3DProps, BoardArrow, StandZones, ZoneRect } from '@/rendering/board3d/types'

export function Board3D(props: Board3DProps) {
  setBoardDims()
  const host = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const piecesReady = useRef(false)
  const state = useRef<SceneState | null>(null)
  const latest = useRef(props)
  latest.current = props
  const previous = useRef<ImmutablePosition | null>(null)
  const power = useRef<Power | null>(null)
  const flipTimer = useRef(0)
  const furigoma = useRef<ReturnType<typeof createFurigoma3D> | null>(null)

  useEffect(() => {
    const el = host.current!
    const renderer = createRenderer()
    el.appendChild(renderer.domElement)
    const s = buildScene(renderer)
    s.avatars = avatarSlot({ root: s.root, camera: s.camera, dims: { thick: THICK, leg: LEG, halfW: HALF_W, halfD: HALF_D } })
    if (latest.current.cues) s.avatars.cue(latest.current.cues)
    state.current = s
    if (import.meta.env.DEV) (window as unknown as { __dbg: SceneState }).__dbg = s
    const refresh = (animate = false, relayout = false) => rebuild(s, latest.current, animate, null, false, relayout)
    s.settle = () => refresh()
    const syncPower = () => {
      const on = getSettings().power
      if (on && !power.current) power.current = createPower(s)
      if (!on && power.current) {
        power.current.dispose()
        power.current = null
      }
    }
    syncPower()
    const unsubscribePower = subscribeSettings(syncPower)

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
      refresh(false, true)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    resize()

    const unbind = bindPointer(s, latest, refresh)
    const cancelPrefetch = s.room.prefetch()
    const reportZones = zoneReporter(s, latest)

    let frame = 0
    let rendered = false
    let live = true
    let boardFontReady = false
    const loop = (time: number) => {
      const dt = Math.min(0.5, (time - (s.lastTime ?? time)) / 1000)
      s.lastTime = time
      if (s.tiltTarget > 0 || latest.current.orbit || s.flip) {
        s.room.need()
        s.avatars?.request()
      }
      updateView(s, latest.current, dt)
      liftSelected(s, latest.current, dt)
      stepTableFlip(s, time, dt, refresh)
      stepAnimations(s, time)
      furigoma.current?.step(dt)
      power.current?.update(dt)
      s.avatars?.update(dt * (power.current?.timeScale() ?? 1), s.flip?.way ?? 0, !!s.controls)
      const shake = flipCameraOffset(s, time)
      if (shake) s.camera.position.add(shake)
      const restoreCamera = power.current?.applyCamera()
      renderer.render(s.scene, s.camera)
      if (!rendered && piecesReady.current && boardFontReady) {
        rendered = true
        setReady(true)
      }
      restoreCamera?.()
      if (shake) s.camera.position.sub(shake)
      if (!performance.getEntriesByName('board-first-frame').length) performance.mark('board-first-frame')
      reportZones()
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    const onFlip = () => {
      power.current?.clear()
      startTableFlip(s)
    }
    const releaseFlip = () => {
      if (!s.flip) return
      power.current?.clear()
      resetTableFlip(s)
      refresh()
    }
    let flipClick: { id: number; x: number; y: number; moved: boolean } | null = null
    const onFlipDown = (event: PointerEvent) => {
      if (!s.flip || !event.isPrimary || event.button !== 0) {
        flipClick = null
        return
      }
      flipClick = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false }
    }
    const onFlipMove = (event: PointerEvent) => {
      if (flipClick?.id === event.pointerId && Math.hypot(event.clientX - flipClick.x, event.clientY - flipClick.y) > 5) flipClick.moved = true
    }
    const onFlipUp = (event: PointerEvent) => {
      if (flipClick?.id === event.pointerId && !flipClick.moved && Math.hypot(event.clientX - flipClick.x, event.clientY - flipClick.y) <= 5) releaseFlip()
      flipClick = null
    }
    const onFlipCancel = () => {
      flipClick = null
    }
    // A browser may drop the GL context under memory pressure; once restored, rebuild every texture and piece.
    const onContextRestored = () => {
      clearFaceTextures()
      refresh()
    }
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored)
    renderer.domElement.addEventListener('pointerdown', onFlipDown)
    renderer.domElement.ownerDocument.addEventListener('pointermove', onFlipMove, true)
    renderer.domElement.ownerDocument.addEventListener('pointerup', onFlipUp, true)
    renderer.domElement.ownerDocument.addEventListener('pointercancel', onFlipCancel, true)
    s.releaseFlip = releaseFlip
    const onSnapshot = (event: Event) => saveSnapshot(s, (event as CustomEvent<string>).detail)
    window.addEventListener(TABLE_FLIP_EVENT, onFlip)
    window.addEventListener(SNAPSHOT_EVENT, onSnapshot)

    document.fonts.load('800 64px "Shippori Mincho B1"').then(() => {
      if (!live) return
      clearFaceTextures()
      refresh()
      boardFontReady = true
    })

    return () => {
      live = false
      cancelAnimationFrame(frame)
      furigoma.current?.dispose()
      furigoma.current = null
      window.removeEventListener(TABLE_FLIP_EVENT, onFlip)
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored)
      renderer.domElement.removeEventListener('pointerdown', onFlipDown)
      renderer.domElement.ownerDocument.removeEventListener('pointermove', onFlipMove, true)
      renderer.domElement.ownerDocument.removeEventListener('pointerup', onFlipUp, true)
      renderer.domElement.ownerDocument.removeEventListener('pointercancel', onFlipCancel, true)
      window.clearTimeout(flipTimer.current)
      window.removeEventListener(SNAPSHOT_EVENT, onSnapshot)
      unbind()
      cancelPrefetch()
      s.avatars?.dispose()
      observer.disconnect()
      unsubscribePower()
      power.current?.dispose()
      power.current = null
      s.controls?.dispose()
      disposeRenderer(renderer)
      el.removeChild(renderer.domElement)
      state.current = null
      piecesReady.current = false
    }
  }, [])

  useEffect(() => {
    const prev = previous.current
    previous.current = props.position
    const s = state.current
    if (!s || (piecesReady.current && prev !== null && prev.sfen === props.position.sfen)) return
    resetTableFlip(s)
    window.clearTimeout(flipTimer.current)
    const changed = prev !== null
    const dragged = performance.now() - (s.droppedAt ?? 0) <= 400
    const stepped = changed ? moveEvent(prev, props.position, latest.current.lastMove) : null
    const event = power.current ? stepped : null
    const fx = power.current
    s.onLand = stepped
      ? () => {
          playSound(stepped.capture ? 'capture' : 'move')
          if (event && fx) fx.onMove({ ...event, delay: 0, carried: true })
        }
      : null
    rebuild(s, latest.current, changed && (!dragged || !!latest.current.lastMove?.endsWith('+')), prev, changed && dragged)
    piecesReady.current = true
    if (s.onLand && event) fx?.onMove({ ...event, delay: dragged ? 0 : 0.22 })
    if (event?.mate)
      flipTimer.current = window.setTimeout(() => {
        startTableFlip(s, event.color === Color.BLACK ? Color.WHITE : Color.BLACK)
      }, 4200)
    else if (!event) fx?.clear()
    s.onLand = null
  }, [props.position])

  useEffect(() => {
    const scene = state.current
    if (!scene || !props.furigoma) return
    const toss = createFurigoma3D(scene, (faces) => latest.current.onFurigoma?.(faces))
    furigoma.current = toss
    return () => {
      toss.dispose()
      if (furigoma.current === toss) furigoma.current = null
    }
  }, [props.furigoma])

  useEffect(() => {
    if (state.current && props.cues) state.current.avatars?.cue(props.cues)
  }, [props.cues])

  useEffect(() => {
    if (state.current) drawMarks(state.current, latest.current)
  }, [
    props.selected,
    props.targets,
    props.arrows,
    props.lastMove,
    props.castles,
    props.stamp,
    props.flipped,
    props.peek,
    props.peekFrom,
    props.checkSquare,
    props.heat,
  ])

  useEffect(() => {
    if (state.current) state.current.tiltTarget = props.tilted ? 1 : 0
  }, [props.tilted])

  useEffect(() => {
    if (state.current) state.current.settled = false
  }, [props.snapKey])

  return (
    <div className="board3d" ref={host} aria-busy={!ready}>
      {!ready && <BoardLoading />}
    </div>
  )
}
