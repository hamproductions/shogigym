import './board.css'
import { useEffect, useRef, useState } from 'react'
import { BoardLoading, type BoardLoadingState } from './BoardLoading'
import { Color, type ImmutablePosition } from 'tsshogi'
import { avatarSlot } from './avatars'
import { updateView } from '@/rendering/board3d/camera'
import { HALF_D, HALF_W, LEG, THICK, compactRendering, pieceSegments, setBoardDims } from '@/rendering/board3d/dimensions'
import { flipCameraOffset, resetTableFlip, saveSnapshot, startTableFlip, stepTableFlip } from '@/rendering/board3d/effects'
import { createFurigoma3D } from '@/rendering/board3d/furigoma'
import { bindPointer } from '@/rendering/board3d/interaction'
import { cameraFit, layout, sideStandsFit, zoneReporter } from '@/rendering/board3d/layout'
import { drawMarks } from '@/rendering/board3d/marks'
import { liftSelected, piecePreparation, rebuild, stepAnimations } from '@/rendering/board3d/pieces'
import { createPower, moveEvent, type Power } from '@/rendering/board3d/power'
import { buildScene, createRenderer, disposeRenderer, disposeScene } from '@/rendering/board3d/scene'
import { preparePieceEnvironment } from '@/rendering/board3d/materials'
import * as THREE from 'three'
import { disposePiece, pieceMesh } from '@/rendering/board3d/piece'
import { clearFaceTextures } from '@/rendering/board3d/textures'
import { disposeUnusedResource } from '@/rendering/board3d/resources'
import { shadowUpdater } from '@/rendering/board3d/shadows'
import type { Board3DProps, SceneState } from '@/rendering/board3d/types'
import { SNAPSHOT_EVENT, TABLE_FLIP_EVENT } from '@/utils/events'
import { getSettings, playSound, subscribeSettings } from '@/appearance/settings'

export type { Board3DProps, BoardArrow, StandZones, ZoneRect } from '@/rendering/board3d/types'

export function Board3D(props: Board3DProps) {
  setBoardDims()
  const host = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [loadingState, setLoadingState] = useState<BoardLoadingState>({ phase: 'pieces', done: 0, total: 1 })
  const piecesReady = useRef(false)
  const state = useRef<SceneState | null>(null)
  const latest = useRef(props)
  latest.current = props
  const previous = useRef<ImmutablePosition | null>(null)
  const power = useRef<Power | null>(null)
  const flipTimer = useRef(0)
  const furigoma = useRef<ReturnType<typeof createFurigoma3D> | null>(null)
  const appearance = useRef<string | undefined>(undefined)
  const pieceFactory = useRef(pieceMesh)
  const zoneFactory = useRef(zoneReporter)
  zoneFactory.current = zoneReporter

  useEffect(() => {
    const el = host.current!
    const renderer = createRenderer()
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    el.appendChild(renderer.domElement)
    const s = buildScene(renderer)
    s.avatars = avatarSlot({ root: s.root, camera: s.camera, dims: { thick: THICK, leg: LEG, halfW: HALF_W, halfD: HALF_D } })
    if (latest.current.cues) s.avatars.cue(latest.current.cues)
    state.current = s
    if (import.meta.env.DEV) (window as unknown as { __dbg: SceneState }).__dbg = s
    const refresh = (animate = false, relayout = false) => {
      if (piecesReady.current && latest.current.assetsReady !== false) rebuild(s, latest.current, animate, null, false, relayout)
    }
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
    const frameTimes: number[] = []
    let fastWindows = 0
    const pixelRatioLimit = Math.min(compactRendering() ? 1.5 : 2, window.devicePixelRatio)
    let width = 0
    let height = 0
    let pixelRatio = renderer.getPixelRatio()
    let resizePending = true
    let bufferPending = false
    let relayoutPending = false

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el
      if (!w || !h) return
      resizePending = false
      pixelRatio = Math.min(pixelRatio, pixelRatioLimit, Math.sqrt(2500000 / (w * h)))
      if (width === w && height === h && renderer.getPixelRatio() === pixelRatio) return
      width = w
      height = h
      bufferPending = true
      frameTimes.length = 0
      const previousFit = cameraFit(s.camera.aspect, s.tilt, latest.current.sideRoom ?? 0)
      s.camera.aspect = w / h
      s.camera.updateProjectionMatrix()
      const narrow = w < 560
      const portrait = !sideStandsFit(w, h)
      const relayout = portrait !== layout.portrait || narrow !== layout.narrow
      layout.portrait = portrait
      layout.narrow = narrow
      if (s.controls && !s.tilePov && !s.flip) {
        const ratio = cameraFit(s.camera.aspect, s.tilt, latest.current.sideRoom ?? 0) / previousFit
        s.camera.position.sub(s.controls.target).multiplyScalar(ratio).add(s.controls.target)
      }
      if (relayout) relayoutPending = true
    }
    const observer = new ResizeObserver(() => {
      resizePending = true
    })
    observer.observe(el)

    const unbind = bindPointer(s, latest, refresh)
    const cancelPrefetch = s.room.prefetch()
    let reportFactory = zoneFactory.current
    let reportZones = reportFactory(s, latest)
    const updateShadows = shadowUpdater(s.scene)

    let frame = 0
    let rendered = false
    let live = true
    let boardFontReady = false
    let compiling = false
    const compiled = new WeakMap<THREE.Material, number>()
    const programsReady = () => {
      const pending = new Map<THREE.Material, number>()
      s.scene.traverse((object) => {
        const material = (object as THREE.Mesh).material
        for (const item of Array.isArray(material) ? material : material ? [material] : [])
          if (compiled.get(item) !== item.version) pending.set(item, item.version)
      })
      if (!compiling && pending.size) {
        compiling = true
        const compilation = renderer.compileAsync(s.scene, s.camera)
        pending.forEach((_, material) => pending.set(material, material.version))
        void compilation.then(() => {
          if (!live) return
          pending.forEach((version, material) => compiled.set(material, version))
          compiling = false
        })
      }
      return !compiling
    }
    const loop = (time: number) => {
      const dt = Math.min(0.5, (time - (s.lastTime ?? time)) / 1000)
      s.lastTime = time
      if (renderer.domElement.parentElement !== el) {
        frame = requestAnimationFrame(loop)
        return
      }
      if (resizePending) resize()
      if (relayoutPending && piecesReady.current && latest.current.assetsReady !== false) {
        refresh(false, true)
        relayoutPending = false
      }
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
      const drew = programsReady()
      if (drew) {
        if (bufferPending) {
          renderer.setDrawingBufferSize(width, height, pixelRatio)
          bufferPending = false
        }
        const before = s.scene.onBeforeRender
        s.scene.onBeforeRender = (...args) => {
          before.apply(s.scene, args)
          updateShadows()
        }
        try {
          renderer.render(s.scene, s.camera)
          s.scene.traverse((object) => {
            const material = (object as THREE.Mesh).material
            for (const item of Array.isArray(material) ? material : material ? [material] : []) compiled.set(item, item.version)
          })
        } finally {
          s.scene.onBeforeRender = before
        }
      }
      if (
        drew &&
        piecesReady.current &&
        latest.current.assetsReady !== false &&
        appearance.current === latest.current.appearanceKey &&
        document.visibilityState === 'visible' &&
        dt > 0 &&
        dt < 0.1
      ) {
        frameTimes.push(dt * 1000)
        if (frameTimes.length === 60) {
          frameTimes.sort((a, b) => a - b)
          if (frameTimes[30] > 20 && pixelRatio > 1) {
            pixelRatio = Math.max(1, pixelRatio - 0.25)
            resizePending = true
            fastWindows = 0
          } else if (frameTimes[30] < 17.5 && frameTimes[54] < 20) {
            if (++fastWindows === 5) {
              pixelRatio = Math.min(pixelRatioLimit, pixelRatio + 0.25, Math.sqrt(2500000 / (width * height)))
              resizePending = true
              fastWindows = 0
            }
          } else {
            fastWindows = 0
          }
          frameTimes.length = 0
        }
      } else frameTimes.length = 0
      if (drew && !rendered && piecesReady.current && boardFontReady) {
        rendered = true
        setReady(true)
        if (!performance.getEntriesByName('board-first-frame').length) performance.mark('board-first-frame')
      }
      restoreCamera?.()
      if (shake) s.camera.position.sub(shake)
      if (reportFactory !== zoneFactory.current) {
        reportFactory = zoneFactory.current
        reportZones = reportFactory(s, latest)
      }
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
      const environment = preparePieceEnvironment(renderer)
      s.scene.traverse((object) => {
        const material = (object as THREE.Mesh).material
        for (const item of Array.isArray(material) ? material : material ? [material] : [])
          if (item instanceof THREE.MeshStandardMaterial && item.envMap) {
            item.envMap = environment
            item.needsUpdate = true
          }
      })
      clearFaceTextures()
      refresh()
      updateShadows(true)
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
      s.room.dispose()
      s.avatars?.dispose()
      observer.disconnect()
      unsubscribePower()
      power.current?.dispose()
      power.current = null
      s.controls?.dispose()
      disposeScene(s.scene)
      disposeRenderer(renderer)
      if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement)
      state.current = null
      piecesReady.current = false
    }
  }, [])

  useEffect(() => {
    if (!piecesReady.current || props.assetsReady === false || appearance.current !== props.appearanceKey) return
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
          latest.current.onMoveLanded?.(props.position.sfen)
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
  }, [props.position, props.assetsReady, props.appearanceKey])

  useEffect(() => {
    const s = state.current
    if (!s || props.assetsReady === false) return
    if (piecesReady.current && appearance.current === props.appearanceKey && pieceFactory.current === pieceMesh) {
      setReady(true)
      return
    }
    let live = true
    let frame = 0
    const initial = !piecesReady.current
    if (initial) setReady(false)
    const settings = getSettings()
    const pending = piecePreparation(s, latest.current.position)
    const total = pending.length
    let done = 0
    setLoadingState({ phase: 'pieces', done, total: Math.max(1, total) })
    const uploaded = new Set<THREE.Texture>()
    const uploads: THREE.Texture[] = []
    let piece: THREE.Object3D | null = null
    const prepare = () => {
      if (!live) return
      const deadline = performance.now() + 6
      do {
        const texture = uploads.shift()
        if (texture) {
          s.renderer.initTexture(texture)
          continue
        }
        if (piece) {
          disposePiece(piece, true)
          piece = null
          setLoadingState({ phase: 'pieces', done: ++done, total })
        }
        const next = pending.shift()
        if (!next) break
        piece = pieceMesh(next.type, next.color, next.grainSeed, pieceSegments(), settings, preparePieceEnvironment(s.renderer, false))
        for (const resource of piece.userData.pieceResources as Set<THREE.Texture | THREE.BufferGeometry>)
          if (resource instanceof THREE.Texture && !uploaded.has(resource)) {
            uploaded.add(resource)
            uploads.push(resource)
          }
      } while (performance.now() < deadline)
      if (uploads.length || pending.length || piece) {
        frame = requestAnimationFrame(prepare)
        return
      }
      s.avatars?.reset?.()
      resetTableFlip(s)
      rebuild(s, latest.current, false)
      uploaded.forEach(disposeUnusedResource)
      piecesReady.current = true
      previous.current = latest.current.position
      appearance.current = props.appearanceKey
      pieceFactory.current = pieceMesh
      setLoadingState({ phase: 'shaders', done: 0, total: 1 })
      if (!initial) setReady(true)
    }
    frame = requestAnimationFrame(prepare)
    return () => {
      live = false
      cancelAnimationFrame(frame)
      if (piece) disposePiece(piece)
      uploaded.forEach(disposeUnusedResource)
    }
  }, [props.appearanceKey, props.assetsReady, pieceMesh])

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
      {!ready && <BoardLoading state={props.assetsReady === false ? props.loadingState : loadingState} />}
    </div>
  )
}
