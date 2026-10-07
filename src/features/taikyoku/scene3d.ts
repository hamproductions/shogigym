import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { PIECE_FONTS, getSettings, loadPieceFont, playSound } from '@/appearance/settings'
import { BOARD_TONE } from '@/rendering/koma'
import { furnishFloor } from '@/rendering/roomFloor'
import { buildRoom } from '@/rendering/room'
import { mm, ROOM_H, TRADITIONAL_ROOM } from '@/utils/roomMetrics'
import { SQ_D, compactRendering, pieceSegments, sideStandsFitFor } from '@/rendering/board3d/dimensions'
import { environmentMap, preparePieceEnvironment, woodMaterial } from '@/rendering/board3d/materials'
import { disposePiece, pieceMesh, setTopCacheLimit } from '@/rendering/board3d/piece'
import { arrowBetween, moveTarget, squareFrame, squareTile } from '@/rendering/board3d/marks'
import { LIFT, stepPieceAnimation, type PieceAnimation } from '@/rendering/board3d/pieces'
import { cameraFitFor, projectedZoneReporter } from '@/rendering/board3d/layout'
import type { StandZones } from '@/rendering/board3d/types'
import { addLights, createRenderer, disposeRenderer, disposeScene } from '@/rendering/board3d/scene'
import { boardSurface, coordPlane, setFaceCacheLimit, srgbTexture } from '@/rendering/board3d/textures'
import { SIZE, catalog, fileLabel, same, type Cell, type EngineMove, type Pos, type Snapshot } from './notation'
import { taikyokuPiece } from './pieces'
import { PieceInstances } from './instances'
import { CAPTURE_BOX, createCaptures } from './captures'
import type { CaptureEntry } from './useTaikyoku'
import type { TargetKind } from './TaikyokuBoard'

export type TaikyokuArrow = { move: EngineMove; color: string; dashed?: boolean; label?: string }

export type Marks = {
  selected: Pos | null
  inspected: Pos | null
  targets: Map<string, TargetKind>
  last: EngineMove | null
  control?: Map<string, { b: Pos[]; w: Pos[] }>
  showControl?: boolean
  arrows?: TaikyokuArrow[]
  peekTargets?: Pos[]
}

export type SceneCallbacks = { onCell: (pos: Pos) => void; onProgress: (done: number, total: number) => void; onZones?: (zones: StandZones | null) => void }

const HX = SIZE / 2
const HZ = (SIZE / 2) * SQ_D
const EDGE = 0.9
const FOV = 30
const MAX_TARGETS = 1500
const THICK = mm(182)
const LEG = mm(95)

export const squareX = (file: number) => file - 0.5 - HX
export const squareZ = (rank: number) => (SIZE / 2 + 0.5 - rank) * SQ_D
const fileAt = (x: number) => Math.round(x + HX + 0.5)
const rankAt = (z: number) => Math.round(SIZE / 2 + 0.5 - z / SQ_D)
const indexOf = ({ file, rank }: Pos) => (rank - 1) * SIZE + (file - 1)

const hash = (text: string) => {
  let h = 17
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) | 0
  return Math.abs(h) + 1
}

type Tween = PieceAnimation & { next?: THREE.Vector3; prepareFinal?: () => void; done?: () => void }
type Fade = { mesh: THREE.Object3D; start: number }
type View = { position: THREE.Vector3; target: THREE.Vector3 }

const ease = (k: number) => 1 - Math.pow(1 - k, 3)

export class TaikyokuScene {
  private renderer = createRenderer()
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 500)
  private controls: OrbitControls
  private pieces = new THREE.Group()
  private instances = new PieceInstances(this.pieces)
  private captureStore: Awaited<ReturnType<typeof createCaptures>> | null = null
  private captures: CaptureEntry[] = []
  private captureGeneration = 0
  private board: THREE.Mesh | null = null
  private reportZones: () => void
  private sideRoom = 0
  private snapshot: Snapshot | null = null
  private appearanceKey = ''
  private fontGeneration = 0
  private marks = new THREE.Group()
  private room = new THREE.Group()
  private cells = new Map<number, THREE.Object3D>()
  private pending = new Map<number, Cell>()
  private total = 0
  private tweens: Tween[] = []
  private fades: Fade[] = []
  private view: { from: View; to: View; start: number; duration: number } | null = null
  private sun: THREE.SpotLight
  private dirty = true
  private shadowDirty = true
  private shown = -1
  private fontsReady = false
  private frame = 0
  private lifted: number | null = null
  private size: { w: number; h: number } | null = null
  private observer: ResizeObserver
  private ray = new THREE.Raycaster()
  private dots: THREE.InstancedMesh
  private frames: THREE.InstancedMesh
  private selectedFrame: THREE.Mesh
  private focusedTile: THREE.Mesh
  private peekTiles: THREE.InstancedMesh
  private peekFrames: THREE.InstancedMesh
  private arrowMarks = new THREE.Group()
  private arrowKey = ''
  private heat = new Map<string, THREE.InstancedMesh>()
  private heatLabels = new Map<number, THREE.InstancedMesh>()
  private keys = new Set<string>()
  private previousFrame = 0
  private forward = new THREE.Vector3()
  private strafe = new THREE.Vector3()
  private travel = new THREE.Vector3()
  private tiles: Record<'selected' | 'inspected' | 'from' | 'to', THREE.Mesh>
  private down: { x: number; y: number; time: number } | null = null
  private disposed = false
  private fitted = true
  private viewport = new THREE.Vector2()
  private textures = new Map<THREE.Texture, number>()
  private listeners: (() => void)[] = []

  private host: HTMLElement
  private callbacks: SceneCallbacks

  constructor(host: HTMLElement, callbacks: SceneCallbacks) {
    this.host = host
    this.callbacks = callbacks
    // hundreds of distinct tiles: keep their faces and carved tops cached instead of rebuilding them
    setFaceCacheLimit(480)
    setTopCacheLimit(480)
    const { renderer, scene, camera } = this
    scene.add(this.room)
    this.sun = this.addLights()
    this.addFloor()
    this.addBoard()
    this.prepareCaptures()
    this.appearanceKey = this.pieceAppearanceKey()
    scene.add(this.pieces, this.marks)
    scene.traverse((object) => {
      const material = (object as THREE.Mesh).material
      for (const item of Array.isArray(material) ? material : material ? [material] : [])
        for (const value of Object.values(item)) if (value instanceof THREE.Texture) this.textures.set(value, value.version)
    })

    this.tiles = {
      selected: this.tile(0xfff1c9, 0.45),
      inspected: this.tile(0xc8442f, 0.22),
      from: this.tile(0xe8a63a, 0.38),
      to: this.tile(0xe8a63a, 0.55),
    }
    const flat = (geometry: THREE.BufferGeometry) => geometry.rotateX(-Math.PI / 2).scale(1, 1, SQ_D)
    this.selectedFrame = squareFrame(0.66, new THREE.MeshBasicMaterial({ color: 0xc8442f, depthWrite: false }))
    this.selectedFrame.rotation.x = -Math.PI / 2
    this.selectedFrame.position.y = 0.006
    this.selectedFrame.visible = false
    this.marks.add(this.selectedFrame, this.arrowMarks)
    this.focusedTile = this.tile(0x9a5ad0, 0.35)
    this.peekTiles = this.batch(squareTile(0xc8442f, 0.26), 0.004)
    this.peekFrames = this.batch(squareFrame(0.62, new THREE.MeshBasicMaterial({ color: 0xb33a26, transparent: true, opacity: 0.7, depthWrite: false })), 0.005)
    this.dots = this.batch(moveTarget(), 0.006)
    this.frames = this.instanced(flat(new THREE.RingGeometry(0.4, 0.5, 4, 1, Math.PI / 4)), 0xd99a1c, 0.95)

    const dom = renderer.domElement
    dom.style.cssText = 'display:block;width:100%;height:100%;touch-action:none'
    host.appendChild(dom)
    this.controls = new OrbitControls(camera, dom)
    this.controls.enableDamping = true
    this.controls.screenSpacePanning = true
    this.controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }
    this.controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }
    this.controls.minDistance = 2 * SQ_D
    this.setZoomBounds()
    this.controls.maxPolarAngle = Math.PI
    this.controls.addEventListener('start', () => {
      this.view = null
      this.fitted = false
    })
    this.controls.addEventListener('change', () => (this.dirty = true))
    this.resetView(false)

    this.observer = new ResizeObserver(() => {
      this.size = { w: host.clientWidth, h: host.clientHeight }
    })
    this.observer.observe(host)
    this.size = { w: host.clientWidth, h: host.clientHeight }
    this.listen(dom, 'pointerdown', (e) => {
      host.focus({ preventScroll: true })
      this.down = e.button === 0 ? { x: e.clientX, y: e.clientY, time: performance.now() } : null
    })
    this.listen(dom, 'pointerup', (e) => this.pointerUp(e))
    this.listen(host, 'keydown', (e) => {
      const target = e.target
      if (
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName)))
      ) {
        this.keys.clear()
        return
      }
      const key = e.key.toLowerCase()
      if (!['w', 'a', 's', 'd'].includes(key)) return
      e.preventDefault()
      this.keys.add(key)
      this.view = null
      this.fitted = false
    })
    this.listen(host, 'keyup', (e) => this.keys.delete(e.key.toLowerCase()))
    this.listen(host, 'focusout', () => this.keys.clear())
    const clearKeys = () => this.keys.clear()
    window.addEventListener('blur', clearKeys)
    this.listeners.push(() => window.removeEventListener('blur', clearKeys))
    this.reportZones = projectedZoneReporter({
      renderer,
      camera,
      onZones: () => this.callbacks.onZones,
      ready: () => !!this.board && !!this.captureStore,
      sideRoom: () => this.sideRoom,
      inputs: () => [
        ...(this.board?.matrixWorld.elements ?? []),
        ...(this.captureStore?.boxes() ?? []).flatMap((box) => [...box.min.toArray(), ...box.max.toArray()]),
      ],
      fits: (width, height) => sideStandsFitFor(width, height, HX + EDGE, HZ + EDGE, this.fitDimensions().stand),
      fit: (aspect, sideRoom, narrow) => cameraFitFor(aspect, 0, sideRoom, this.fitDimensions(), false, narrow),
      board: () => new THREE.Box3().setFromObject(this.board!),
      stands: () => this.captureStore!.boxes(),
      obstacles: () => [new THREE.Box3().setFromObject(this.board!), ...this.captureStore!.boxes()],
    })
    this.prepareFonts()
    this.loop()
  }

  // Faces are only cached once their font subset is loaded, so load every character the 400 tiles use up front.
  private async loadFonts() {
    const font = getSettings().pieceFont
    await loadPieceFont(font).catch(() => undefined)
    const chars = new Set<string>()
    for (const info of Object.values(catalog)) for (const ch of info.k + (info.k2 ?? '')) chars.add(ch)
    const spec = PIECE_FONTS[font]
    await document.fonts.load(`${spec.weight} 100px "${spec.family}"`, [...chars].join('')).catch(() => undefined)
  }

  private prepareFonts() {
    const generation = ++this.fontGeneration
    this.fontsReady = false
    void this.loadFonts().then(() => {
      if (this.disposed || generation !== this.fontGeneration) return
      this.fontsReady = true
      this.dirty = true
    })
  }

  private pieceAppearanceKey() {
    const settings = getSettings()
    return JSON.stringify([
      settings.pieceMaterial,
      settings.pieceFinish,
      settings.pieceColor,
      settings.pieceGrain,
      settings.pieceFont,
      settings.pieceStyle,
      settings.pieceSet,
    ])
  }

  syncAppearance() {
    const key = this.pieceAppearanceKey()
    if (key === this.appearanceKey) return
    this.appearanceKey = key
    this.finishAnimations()
    for (const mesh of this.cells.values()) this.drop(mesh)
    this.cells.clear()
    this.prepareCaptures()
    this.prepareFonts()
    if (this.snapshot) this.setPosition(this.snapshot, null)
    this.shadowDirty = this.dirty = true
  }

  // --- building the room -------------------------------------------------

  private addLights() {
    addLights(this.scene, compactRendering() ? 1024 : 2048)
    const lamp = this.scene.children.find((object): object is THREE.SpotLight => object instanceof THREE.SpotLight && object.castShadow)!
    lamp.shadow.autoUpdate = false
    return lamp
  }

  private addFloor() {
    const floor = new THREE.Mesh()
    floor.receiveShadow = true
    const dims = { thick: THICK, leg: LEG, halfW: HX + EDGE, halfD: HZ + EDGE, floor }
    furnishFloor(this.room, dims, false)
    buildRoom(this.room, dims)
  }

  private addBoard() {
    const style = getSettings().boardStyle
    const tone = BOARD_TONE[style]
    const env = environmentMap()
    const surface = srgbTexture(boardSurface(style, 2048, 2048), 8)
    const top = new THREE.MeshPhysicalMaterial({ map: surface, roughness: 0.55, clearcoat: 0.15, clearcoatRoughness: 0.45, envMap: env, envMapIntensity: 0.25 })
    const w = 2 * (HX + EDGE)
    const d = 2 * (HZ + EDGE)
    const board = new THREE.Mesh(new THREE.BoxGeometry(w, THICK, d), [
      woodMaterial(tone.edge, 3),
      woodMaterial(tone.edge, 5),
      top,
      woodMaterial([150, 104, 50], 9),
      woodMaterial(tone.edge, 11),
      woodMaterial(tone.edge, 13),
    ])
    this.board = board
    board.position.y = -THICK / 2
    board.castShadow = true
    board.receiveShadow = true
    this.scene.add(board)

    const legMaterial = woodMaterial([120, 78, 36], 17)
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.55, LEG, 24), legMaterial)
      leg.position.set(sx * (HX - 4), -THICK - LEG / 2, sz * (HZ - 4))
      leg.castShadow = true
      this.scene.add(leg)
    }

    // grid lines as geometry, so they stay sharp however far the camera zooms in
    const line = 0.032
    const quads: THREE.BufferGeometry[] = []
    for (let i = 0; i <= SIZE; i++) {
      quads.push(new THREE.PlaneGeometry(line, 2 * HZ).rotateX(-Math.PI / 2).translate(i - HX, 0, 0))
      quads.push(new THREE.PlaneGeometry(2 * HX, line).rotateX(-Math.PI / 2).translate(0, 0, (i - SIZE / 2) * SQ_D))
    }
    const rgb = /(\d+),\s*(\d+),\s*(\d+)/.exec(tone.line)
    const ink = new THREE.Color(rgb ? `rgb(${rgb[1]},${rgb[2]},${rgb[3]})` : tone.line)
    const grid = new THREE.Mesh(
      mergeGeometries(quads),
      new THREE.MeshBasicMaterial({ color: ink, transparent: true, opacity: 0.8, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    )
    grid.position.y = 0.002
    this.scene.add(grid)

    for (let f = 1; f <= SIZE; f++) {
      const label = coordPlane(fileLabel(f), 0.5, false)
      label.position.set(squareX(f), 0.004, HZ + EDGE / 2)
      this.scene.add(label)
    }
    for (let r = 1; r <= SIZE; r++) {
      const label = coordPlane(String(r), 0.5, false)
      label.position.set(-HX - EDGE / 2, 0.004, squareZ(r))
      this.scene.add(label)
    }
  }

  private prepareCaptures() {
    const generation = ++this.captureGeneration
    this.captureStore?.dispose()
    this.captureStore = null
    void createCaptures({
      parent: this.scene,
      make: (cell) => this.make(cell),
      position: (pos) => new THREE.Vector3(squareX(pos.file), 0, squareZ(pos.rank)),
      floorY: -THICK - LEG,
      onInvalidate: () => {
        this.shadowDirty = this.dirty = true
      },
    })
      .then((store) => {
        if (this.disposed || generation !== this.captureGeneration) return store.dispose()
        this.captureStore = store
        store.sync(this.captures, false)
        if (this.fitted) this.resetView(false)
        this.shadowDirty = this.dirty = true
      })
      .catch((error) => console.warn('capture physics not loaded', error))
  }

  private tile(color: number, opacity: number) {
    const mesh = squareTile(color, opacity)
    const material = mesh.material as THREE.MeshBasicMaterial
    material.polygonOffset = true
    material.polygonOffsetFactor = -2
    material.polygonOffsetUnits = -2
    mesh.renderOrder = 3
    mesh.rotation.x = -Math.PI / 2
    mesh.position.y = 0.004
    mesh.visible = false
    this.marks.add(mesh)
    return mesh
  }

  private batch(source: THREE.Mesh, y: number) {
    const material = source.material as THREE.MeshBasicMaterial
    material.polygonOffset = true
    material.polygonOffsetFactor = -1
    material.polygonOffsetUnits = -1
    source.rotation.x = -Math.PI / 2
    source.updateMatrix()
    source.geometry.applyMatrix4(source.matrix)
    const mesh = new THREE.InstancedMesh(source.geometry, source.material, MAX_TARGETS)
    mesh.count = 0
    mesh.position.y = y
    mesh.frustumCulled = false
    this.marks.add(mesh)
    return mesh
  }

  private instanced(geometry: THREE.BufferGeometry, color: number, opacity: number) {
    const mesh = new THREE.InstancedMesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      }),
      MAX_TARGETS,
    )
    mesh.count = 0
    mesh.position.y = 0.02
    mesh.frustumCulled = false
    this.marks.add(mesh)
    return mesh
  }

  // --- camera ------------------------------------------------------------

  private fitView(): View {
    const aspect = this.camera.aspect || 1
    const angle = 0.82
    const extent = cameraFitFor(aspect, 1, this.sideRoom, this.fitDimensions())
    const distance = Math.min(extent / (2 * Math.tan((FOV * Math.PI) / 360)), (ROOM_H - THICK - LEG - mm(20)) / Math.cos(angle))
    this.camera.fov = (2 * Math.atan(extent / (2 * distance)) * 180) / Math.PI
    this.camera.updateProjectionMatrix()
    return { target: new THREE.Vector3(0, 0, 0), position: new THREE.Vector3(0, Math.cos(angle) * distance, Math.sin(angle) * distance) }
  }

  private fitDimensions() {
    const boxes = this.captureStore?.boxes()
    const extent = boxes?.length ? Math.max(...boxes.flatMap((box) => [Math.abs(box.min.x), Math.abs(box.max.x)])) : HX + CAPTURE_BOX.width + 1.8
    return { halfW: HX + EDGE, halfD: HZ + EDGE, stand: extent - HX - EDGE - 0.4, stripD: 0, stripZ: HZ + EDGE + 0.25 }
  }

  setSideRoom(sideRoom: number) {
    if (this.sideRoom === sideRoom) return
    this.sideRoom = sideRoom
    if (this.fitted) this.resetView(false)
    this.dirty = true
  }

  private resetView(animate: boolean) {
    this.moveTo(this.fitView(), animate)
  }

  private setZoomBounds() {
    const radius = Math.hypot(TRADITIONAL_ROOM.halfX, TRADITIONAL_ROOM.halfZ, ROOM_H / 2)
    this.controls.maxDistance = 2 * radius
    this.camera.far = this.controls.maxDistance + 2 * radius
    this.camera.updateProjectionMatrix()
  }

  private moveTo(to: View, animate: boolean) {
    if (!animate) {
      this.camera.position.copy(to.position)
      this.controls.target.copy(to.target)
      this.camera.lookAt(to.target)
      this.view = null
      this.dirty = true
      return
    }
    this.view = { from: { position: this.camera.position.clone(), target: this.controls.target.clone() }, to, start: performance.now(), duration: 520 }
  }

  fit() {
    this.fitted = true
    this.resetView(true)
  }

  focus(pos: Pos, cellPx = 40) {
    this.fitted = false
    const height = this.host.clientHeight || 600
    // the 2D map's pixels-per-cell, translated to how many board squares fill the view
    const cells = Math.max(6, Math.min(30, height / (cellPx * 2.2)))
    const distance = (cells * SQ_D) / (2 * Math.tan((FOV * Math.PI) / 360))
    const angle = 0.85
    const target = new THREE.Vector3(squareX(pos.file), 0, squareZ(pos.rank))
    this.moveTo({ target, position: new THREE.Vector3(target.x, Math.cos(angle) * distance, target.z + Math.sin(angle) * distance) }, true)
  }

  // --- pieces ------------------------------------------------------------

  private make(cell: Cell) {
    const { type, color, face } = taikyokuPiece(cell.key, cell.side)
    const mesh = pieceMesh(
      type,
      color,
      hash(cell.key + cell.side),
      pieceSegments(),
      { pieceGuide: 'none' },
      preparePieceEnvironment(this.renderer, false),
      false,
      face,
    )
    mesh.userData.cell = cell
    return mesh
  }

  private place(mesh: THREE.Object3D, pos: Pos) {
    mesh.position.set(squareX(pos.file), 0, squareZ(pos.rank))
  }

  private retire(mesh: THREE.Object3D, fade: boolean) {
    this.instances.remove(mesh)
    this.pieces.add(mesh)
    if (fade) this.fades.push({ mesh, start: performance.now() })
    else this.drop(mesh)
  }

  private drop(mesh: THREE.Object3D) {
    this.instances.remove(mesh)
    this.pieces.remove(mesh)
    disposePiece(mesh, true)
  }

  private finishAnimations() {
    for (const t of this.tweens.splice(0)) {
      stepPieceAnimation(t, t.start + (t.duration ?? (t.flip ? 550 : 220)))
      if (t.next) {
        t.from.copy(t.to)
        t.to = t.next
        t.next = undefined
        t.prepareFinal?.()
        stepPieceAnimation(t, t.start + (t.duration ?? (t.flip ? 550 : 220)))
      }
      t.done?.()
      if (!t.done) this.instances.add(t.mesh)
    }
    for (const f of this.fades.splice(0)) this.drop(f.mesh)
  }

  setPosition(snap: Snapshot, last: EngineMove | null) {
    const previous = this.snapshot
    this.snapshot = snap
    this.finishAnimations()
    const grid = snap.grid
    const now = performance.now()
    const moving = last
    let landing: Tween | null = null

    if (moving) {
      const mesh = this.cells.get(indexOf(moving.from))
      const target = grid[moving.to.rank - 1][moving.to.file - 1]
      if (mesh && target && (mesh.userData.cell as Cell).side === target.side) {
        const from = mesh.position.clone()
        this.instances.remove(mesh)
        this.pieces.add(mesh)
        const to = new THREE.Vector3(squareX(moving.to.file), 0, squareZ(moving.to.rank))
        const promoted = (mesh.userData.cell as Cell).key !== target.key
        const capture = !!previous && previous.counts.b + previous.counts.w > snap.counts.b + snap.counts.w
        landing = { mesh, from, to, start: now, land: () => playSound(capture ? 'capture' : 'move') }
        this.cells.delete(indexOf(moving.from))
        const captured = this.cells.get(indexOf(moving.to))
        if (captured && captured !== mesh) {
          this.cells.delete(indexOf(moving.to))
          this.retire(captured, true)
        }
        if (moving.mid) {
          landing.next = to
          landing.to = new THREE.Vector3(squareX(moving.mid.file), 0, squareZ(moving.mid.rank))
        }
        if (promoted) {
          const animation = landing
          const promote = () => {
            const fresh = this.make(target)
            fresh.position.copy(animation.from)
            fresh.visible = false
            this.pieces.add(fresh)
            animation.mesh = fresh
            animation.flip = mesh
            animation.done = () => {
              this.instances.add(fresh)
              this.cells.set(indexOf(moving.to), fresh)
              this.shadowDirty = this.dirty = true
            }
          }
          if (landing.next) landing.prepareFinal = promote
          else promote()
        } else this.cells.set(indexOf(moving.to), mesh)
        this.tweens.push(landing)
      }
    }

    // everything else: reconcile the scene with the snapshot
    this.pending.clear()
    for (let rank = 1; rank <= SIZE; rank++) {
      for (let file = 1; file <= SIZE; file++) {
        const idx = indexOf({ file, rank })
        const want = grid[rank - 1][file - 1]
        const have = this.cells.get(idx)
        const haveCell = have?.userData.cell as Cell | undefined
        const promotionLanding = landing && moving && same(moving.to, { file, rank }) && (landing.flip || landing.prepareFinal)
        if (want && have && haveCell && haveCell.key === want.key && haveCell.side === want.side) continue
        if (promotionLanding) continue
        if (have) {
          this.cells.delete(idx)
          this.retire(have, !!moving && same(moving.to, { file, rank }))
        }
        if (want) this.pending.set(idx, want)
      }
    }
    this.total = Math.max(this.total, this.pending.size)
    if (this.pending.size) this.callbacks.onProgress(this.total - this.pending.size, this.total)
    else this.callbacks.onProgress(1, 1)
    if (landing) landing.start = now
    this.instances.update()
    this.shadowDirty = this.dirty = true
  }

  private pump() {
    if (!this.pending.size || !this.fontsReady) return
    const target = this.controls.target
    const order = [...this.pending.entries()].sort(([a], [b]) => {
      const da = Math.hypot(squareX((a % SIZE) + 1) - target.x, squareZ(Math.floor(a / SIZE) + 1) - target.z)
      const db = Math.hypot(squareX((b % SIZE) + 1) - target.x, squareZ(Math.floor(b / SIZE) + 1) - target.z)
      return da - db
    })
    const started = performance.now()
    for (const [idx, cell] of order) {
      // a long first build hands control back to input every frame
      if (performance.now() - started > 8) break
      this.pending.delete(idx)
      const mesh = this.make(cell)
      this.place(mesh, { file: (idx % SIZE) + 1, rank: Math.floor(idx / SIZE) + 1 })
      this.instances.add(mesh)
      this.cells.set(idx, mesh)
    }
    this.callbacks.onProgress(this.total - this.pending.size, this.total)
    if (!this.pending.size) this.total = 0
    this.instances.update()
    this.shadowDirty = this.dirty = true
  }

  setCaptures(captures: CaptureEntry[], animate: boolean) {
    this.finishAnimations()
    const added = captures.slice(this.captures.length)
    this.captures = captures.slice()
    this.captureStore?.sync(captures, animate, animate)
    if (animate && this.captureStore) {
      for (const record of added) {
        const index = indexOf(record.from)
        const mesh = this.cells.get(index)
        const origin = mesh?.position.clone() ?? new THREE.Vector3(squareX(record.from.file), 0, squareZ(record.from.rank))
        if (mesh) {
          this.instances.remove(mesh)
          this.cells.delete(index)
        }
        this.captureStore.throw(record, mesh, origin)
      }
      this.instances.update()
    }
    this.shadowDirty = this.dirty = true
  }

  private stepCaptures(delta: number) {
    if (this.captureStore?.tick(delta)) this.shadowDirty = this.dirty = true
  }

  // --- marks -------------------------------------------------------------

  setMarks({ selected, inspected, targets, last, control, showControl, arrows, peekTargets }: Marks) {
    this.lifted = selected ? indexOf(selected) : null
    const put = (mesh: THREE.Mesh, pos: Pos | null) => {
      mesh.visible = !!pos
      if (pos) mesh.position.set(squareX(pos.file), mesh.position.y, squareZ(pos.rank))
    }
    put(this.tiles.selected, selected)
    put(this.selectedFrame, selected)
    const piece = inspected && this.snapshot?.grid[inspected.rank - 1]?.[inspected.file - 1]
    put(this.tiles.inspected, piece ? inspected : null)
    put(this.focusedTile, inspected && !piece ? inspected : null)
    const focus = inspected ? control?.get(`${inspected.file},${inspected.rank}`) : undefined
    const difference = (focus?.b.length ?? 0) - (focus?.w.length ?? 0)
    ;(this.focusedTile.material as THREE.MeshBasicMaterial).color.setHex(difference > 0 ? 0x1f7ae0 : difference < 0 ? 0xd2402a : 0x9a5ad0)
    put(this.tiles.from, last?.from ?? null)
    put(this.tiles.to, last && !same(last.from, last.to) ? last.to : null)
    this.dots.count = this.frames.count = 0
    const matrix = new THREE.Matrix4()
    targets.forEach((kind, key) => {
      const mesh = kind === 'via' ? this.frames : this.dots
      if (mesh.count >= MAX_TARGETS) return
      const [file, rank] = key.split(',').map(Number)
      matrix.makeTranslation(squareX(file), 0, squareZ(rank))
      mesh.setMatrixAt(mesh.count++, matrix)
    })
    this.dots.instanceMatrix.needsUpdate = this.frames.instanceMatrix.needsUpdate = true
    this.peekTiles.count = this.peekFrames.count = 0
    const covered = [...(peekTargets ?? []), ...(!piece && focus ? [...focus.b, ...focus.w] : [])]
    const seen = new Set<string>()
    for (const pos of covered) {
      const key = `${pos.file},${pos.rank}`
      if (seen.has(key) || this.peekTiles.count >= MAX_TARGETS) continue
      seen.add(key)
      matrix.makeTranslation(squareX(pos.file), 0, squareZ(pos.rank))
      this.peekTiles.setMatrixAt(this.peekTiles.count++, matrix)
      this.peekFrames.setMatrixAt(this.peekFrames.count++, matrix)
    }
    this.peekTiles.instanceMatrix.needsUpdate = this.peekFrames.instanceMatrix.needsUpdate = true
    this.setArrows(arrows ?? [])
    this.setControl(showControl ? control : undefined)
    this.dirty = true
  }

  private setArrows(arrows: TaikyokuArrow[]) {
    const key = JSON.stringify(arrows)
    if (key === this.arrowKey) return
    this.arrowKey = key
    this.arrowMarks.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      object.geometry.dispose()
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        const map = (material as THREE.MeshBasicMaterial).map
        if (map && !map.userData.shared) map.dispose()
        material.dispose()
      }
    })
    this.arrowMarks.clear()
    const stacked = new Map<string, number>()
    for (const arrow of arrows) {
      const points = [arrow.move.from, ...(arrow.move.mid ? [arrow.move.mid] : []), arrow.move.to]
      const destination = `${arrow.move.to.file},${arrow.move.to.rank}`
      const stack = stacked.get(destination) ?? 0
      if (arrow.label) stacked.set(destination, stack + 1)
      for (let index = 1; index < points.length; index++) {
        const from = points[index - 1]
        const to = points[index]
        if (same(from, to)) continue
        this.arrowMarks.add(
          arrowBetween(
            { ...arrow, label: index === points.length - 1 ? arrow.label : undefined, usi: arrow.move.text },
            new THREE.Vector3(squareX(from.file), 0.05, squareZ(from.rank)),
            new THREE.Vector3(squareX(to.file), 0.05, squareZ(to.rank)),
            stack,
          ),
        )
      }
    }
  }

  private setControl(control?: Marks['control']) {
    for (const mesh of [...this.heat.values(), ...this.heatLabels.values()]) mesh.count = 0
    const matrix = new THREE.Matrix4()
    for (const [key, cell] of control ?? []) {
      if (!cell.b.length && !cell.w.length) continue
      const [file, rank] = key.split(',').map(Number)
      if (!Number.isInteger(file) || !Number.isInteger(rank) || file < 1 || file > SIZE || rank < 1 || rank > SIZE) continue
      const difference = cell.b.length - cell.w.length
      const color = difference > 0 ? 0x1f7ae0 : difference < 0 ? 0xd2402a : 0x9a5ad0
      const opacity = Math.min(0.42, 0.14 + 0.1 * Math.abs(difference || 1))
      const batch = `${color}/${opacity}`
      let tile = this.heat.get(batch)
      if (!tile) {
        tile = this.batch(squareTile(color, opacity), 0.004)
        tile.position.y = 0.004
        tile.renderOrder = 1
        this.heat.set(batch, tile)
      }
      matrix.makeTranslation(squareX(file), 0, squareZ(rank))
      tile.setMatrixAt(tile.count++, matrix)
      const count = difference ? Math.abs(difference) : cell.b.length
      let label = this.heatLabels.get(count)
      if (!label) {
        const source = coordPlane(String(count), 0.34, false)
        source.geometry.rotateX(-Math.PI / 2)
        label = new THREE.InstancedMesh(source.geometry, source.material, SIZE * SIZE)
        label.count = 0
        label.frustumCulled = false
        label.renderOrder = 2
        this.marks.add(label)
        this.heatLabels.set(count, label)
      }
      matrix.makeTranslation(squareX(file) + 0.32, 0.06, squareZ(rank) + 0.3)
      label.setMatrixAt(label.count++, matrix)
    }
    for (const mesh of [...this.heat.values(), ...this.heatLabels.values()]) mesh.instanceMatrix.needsUpdate = true
  }

  // --- input -------------------------------------------------------------

  private listen<K extends keyof HTMLElementEventMap>(el: HTMLElement, type: K, handler: (e: HTMLElementEventMap[K]) => void) {
    el.addEventListener(type, handler)
    this.listeners.push(() => el.removeEventListener(type, handler))
  }

  private pointerUp(e: PointerEvent) {
    const down = this.down
    this.down = null
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6 || performance.now() - down.time > 700) return
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.ray.setFromCamera(new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1), this.camera)
    const pieces = [...this.cells.values()]
    for (const mesh of pieces) mesh.updateMatrixWorld(true)
    const tile = this.ray.intersectObjects(pieces, true)[0]
    if (tile) {
      let object: THREE.Object3D | null = tile.object
      while (object && !object.userData.cell) object = object.parent
      if (object) {
        for (const [index, mesh] of this.cells) {
          if (mesh !== object) continue
          this.callbacks.onCell({ file: (index % SIZE) + 1, rank: Math.floor(index / SIZE) + 1 })
          return
        }
      }
    }
    const hit = new THREE.Vector3()
    if (!this.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit)) return
    const pos = { file: fileAt(hit.x), rank: rankAt(hit.z) }
    if (pos.file >= 1 && pos.file <= SIZE && pos.rank >= 1 && pos.rank <= SIZE) this.callbacks.onCell(pos)
  }

  // --- loop --------------------------------------------------------------

  private loop = () => {
    if (this.disposed) return
    this.frame = requestAnimationFrame(this.loop)
    const now = performance.now()
    const delta = this.previousFrame ? Math.min(0.05, (now - this.previousFrame) / 1000) : 0
    this.previousFrame = now
    const { renderer, camera, controls } = this
    for (const [texture, version] of this.textures)
      if (texture.version !== version) {
        this.textures.set(texture, texture.version)
        this.dirty = true
      }
    renderer.getSize(this.viewport)
    if (this.size && (this.viewport.x !== this.size.w || this.viewport.y !== this.size.h || camera.aspect !== this.size.w / this.size.h)) {
      const { w, h } = this.size
      if (w > 0 && h > 0) {
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        this.setZoomBounds()
        if (this.fitted) this.resetView(false)
        this.dirty = true
      }
    }
    if (this.view) {
      const k = Math.min(1, (now - this.view.start) / this.view.duration)
      const e = ease(k)
      camera.position.lerpVectors(this.view.from.position, this.view.to.position, e)
      controls.target.lerpVectors(this.view.from.target, this.view.to.target, e)
      if (k >= 1) this.view = null
      this.dirty = true
    }
    this.moveCamera(delta)
    controls.update()
    const near = Math.max(0.1, Math.min(1, controls.getDistance() * 0.01))
    if (camera.near !== near) {
      camera.near = near
      camera.updateProjectionMatrix()
    }
    this.keepOnBoard()
    this.keepCameraClear()
    this.animate(now)
    this.pump()
    const settling = 1 - Math.exp(-delta * 18)
    for (const [index, mesh] of this.cells) {
      if (this.tweens.some((tween) => tween.mesh === mesh || tween.flip === mesh)) continue
      const target = index === this.lifted ? LIFT : 0
      const height = target ? target : Math.abs(mesh.position.y) < 0.001 ? 0 : mesh.position.y * (1 - settling)
      if (height === mesh.position.y) continue
      this.instances.remove(mesh)
      mesh.position.y = height
      this.instances.add(mesh)
      this.dirty = this.shadowDirty = true
    }
    this.instances.update()
    this.stepCaptures(delta)
    if (!this.dirty) return
    // while the first 800 tiles are still being built, repaint at each quarter instead of every frame
    if (this.pending.size && this.total) {
      const built = 1 - this.pending.size / this.total
      if (built < this.shown + 0.25) return
      this.shown = built
    } else this.shown = -1
    this.dirty = false
    this.reportZones()
    this.followSun()
    renderer.render(this.scene, camera)
  }

  private keepOnBoard() {
    const t = this.controls.target
    const clearance = mm(20)
    const x = THREE.MathUtils.clamp(t.x, -TRADITIONAL_ROOM.halfX + clearance, TRADITIONAL_ROOM.halfX - clearance)
    const y = THREE.MathUtils.clamp(t.y, -THICK - LEG + clearance, ROOM_H - THICK - LEG - clearance)
    const z = THREE.MathUtils.clamp(t.z, -TRADITIONAL_ROOM.halfZ + clearance, TRADITIONAL_ROOM.halfZ - clearance)
    if (x !== t.x || y !== t.y || z !== t.z) {
      this.camera.position.x += x - t.x
      this.camera.position.y += y - t.y
      this.camera.position.z += z - t.z
      t.x = x
      t.y = y
      t.z = z
    }
  }

  private moveCamera(delta: number) {
    if (!this.keys.size) return
    this.camera.getWorldDirection(this.forward)
    this.forward.y = 0
    if (this.forward.lengthSq() < 0.0001) this.forward.set(0, 1, 0).applyQuaternion(this.camera.quaternion).setY(0)
    if (this.forward.lengthSq() < 0.0001) this.forward.set(0, 0, -1)
    this.forward.normalize()
    this.strafe.set(-this.forward.z, 0, this.forward.x)
    this.travel
      .copy(this.forward)
      .multiplyScalar(Number(this.keys.has('w')) - Number(this.keys.has('s')))
      .addScaledVector(this.strafe, Number(this.keys.has('d')) - Number(this.keys.has('a')))
    if (!this.travel.lengthSq()) return
    this.travel.normalize().multiplyScalar(20 * delta)
    this.camera.position.add(this.travel)
    this.controls.target.add(this.travel)
    this.dirty = true
  }

  private keepCameraClear() {
    const position = this.camera.position
    const clearance = mm(20) + this.camera.near * Math.hypot(1, Math.tan((this.camera.fov * Math.PI) / 360) * Math.hypot(1, this.camera.aspect))
    const floor = -THICK - LEG + clearance
    const x = THREE.MathUtils.clamp(position.x, -TRADITIONAL_ROOM.halfX + clearance, TRADITIONAL_ROOM.halfX - clearance)
    const z = THREE.MathUtils.clamp(position.z, -TRADITIONAL_ROOM.halfZ + clearance, TRADITIONAL_ROOM.halfZ - clearance)
    let y = THREE.MathUtils.clamp(position.y, floor, -THICK - LEG + ROOM_H - clearance)
    if (Math.abs(x) < HX + EDGE + clearance && Math.abs(z) < HZ + EDGE + clearance && y > -THICK - clearance && y < clearance)
      y = y > -THICK / 2 ? clearance : -THICK - clearance
    if (x === position.x && y === position.y && z === position.z) return
    position.set(x, y, z)
    this.camera.lookAt(this.controls.target)
    this.dirty = true
  }

  private animate(now: number) {
    if (this.tweens.length || this.fades.length) this.dirty = this.shadowDirty = true
    this.tweens = this.tweens.filter((t) => {
      if (!stepPieceAnimation(t, now)) return true
      if (t.next) {
        t.from.copy(t.to)
        t.to = t.next
        t.next = undefined
        t.start = now
        t.prepareFinal?.()
        return true
      }
      t.land?.()
      t.done?.()
      if (!t.done) this.instances.add(t.mesh)
      this.instances.update()
      return false
    })
    this.fades = this.fades.filter((f) => {
      const k = Math.min(1, (now - f.start) / 260)
      f.mesh.scale.setScalar(1 - ease(k))
      f.mesh.position.y = -0.4 * k
      if (k < 1) return true
      this.drop(f.mesh)
      return false
    })
  }

  private followSun() {
    if (!this.shadowDirty) return
    this.sun.shadow.needsUpdate = true
    this.shadowDirty = false
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.frame)
    this.observer.disconnect()
    this.listeners.forEach((off) => off())
    this.controls.dispose()
    this.finishAnimations()
    this.instances.dispose()
    this.captureStore?.dispose()
    for (const mesh of this.cells.values()) {
      mesh.removeFromParent()
      disposePiece(mesh)
    }
    const dom = this.renderer.domElement
    dom.remove()
    this.cells.clear()
    this.pending.clear()
    this.textures.clear()
    disposeScene(this.scene)
    disposeRenderer(this.renderer)
  }
}
