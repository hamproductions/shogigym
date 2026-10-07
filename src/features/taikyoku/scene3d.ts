import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { Color, PieceType } from 'tsshogi'
import { PIECE_FONTS, getSettings, loadPieceFont, playSound, type PieceAppearance } from '@/appearance/settings'
import { BOARD_TONE } from '@/rendering/koma'
import { planks, standard, tileUV } from '@/rendering/roomFloor'
import { LEG, SQ_D, THICK, compactRendering, pieceScale, pieceSegments, setBoardDims } from '@/rendering/board3d/dimensions'
import { environmentMap, preparePieceEnvironment, woodMaterial } from '@/rendering/board3d/materials'
import { disposePiece, pieceMesh, setTopCacheLimit } from '@/rendering/board3d/piece'
import { createRenderer, disposeRenderer, disposeScene } from '@/rendering/board3d/scene'
import { boardSurface, coordPlane, setFaceCacheLimit, srgbTexture } from '@/rendering/board3d/textures'
import { SIZE, catalog, fileLabel, glyphOf, same, type Cell, type EngineMove, type Pos, type Snapshot } from './notation'
import type { TargetKind } from './TaikyokuBoard'

export type Marks = { selected: Pos | null; inspected: Pos | null; targets: Map<string, TargetKind>; last: EngineMove | null }

export type SceneCallbacks = { onCell: (pos: Pos) => void; onProgress: (done: number, total: number) => void }

const HX = SIZE / 2
const HZ = (SIZE / 2) * SQ_D
const EDGE = 0.9
const FOV = 30
const MAX_TARGETS = 1500

export const squareX = (file: number) => file - 0.5 - HX
export const squareZ = (rank: number) => (SIZE / 2 + 0.5 - rank) * SQ_D
const fileAt = (x: number) => Math.round(x + HX + 0.5)
const rankAt = (z: number) => Math.round(SIZE / 2 + 0.5 - z / SQ_D)
const indexOf = ({ file, rank }: Pos) => (rank - 1) * SIZE + (file - 1)

// Tile sizes follow the shogi ones: the bigger the piece's worth, the bigger the tile.
function tileScale(key: string) {
  const info = catalog[key]
  if (!info) return pieceScale(PieceType.PAWN)
  if (info.r) return pieceScale(PieceType.KING)
  if (info.v >= 450) return pieceScale(PieceType.ROOK)
  if (info.v >= 300) return pieceScale(PieceType.GOLD)
  if (info.v >= 150) return pieceScale(PieceType.KNIGHT)
  return pieceScale(PieceType.PAWN)
}

const hash = (text: string) => {
  let h = 17
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) | 0
  return Math.abs(h) + 1
}

type Tween = { mesh: THREE.Object3D; from: THREE.Vector3; to: THREE.Vector3; start: number; duration: number; arc: number; done?: () => void }
type Fade = { mesh: THREE.Object3D; start: number }
type View = { position: THREE.Vector3; target: THREE.Vector3 }

const ease = (k: number) => 1 - Math.pow(1 - k, 3)

export class TaikyokuScene {
  private renderer = createRenderer()
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 500)
  private controls: OrbitControls
  private pieces = new THREE.Group()
  private marks = new THREE.Group()
  private cells = new Map<number, THREE.Object3D>()
  private pending = new Map<number, Cell>()
  private total = 0
  private tweens: Tween[] = []
  private fades: Fade[] = []
  private view: { from: View; to: View; start: number; duration: number } | null = null
  private sun: THREE.DirectionalLight
  private shadowTarget = new THREE.Vector3(1e9, 0, 0)
  private dirty = true
  private shadowDirty = true
  private shown = -1
  private fontsReady = false
  private frame = 0
  private size: { w: number; h: number } | null = null
  private observer: ResizeObserver
  private appearance: PieceAppearance
  private ray = new THREE.Raycaster()
  private dots: THREE.InstancedMesh
  private rings: THREE.InstancedMesh
  private frames: THREE.InstancedMesh
  private tiles: Record<'selected' | 'inspected' | 'from' | 'to', THREE.Mesh>
  private down: { x: number; y: number; time: number } | null = null
  private disposed = false
  private listeners: (() => void)[] = []

  private host: HTMLElement
  private callbacks: SceneCallbacks

  constructor(host: HTMLElement, callbacks: SceneCallbacks) {
    this.host = host
    this.callbacks = callbacks
    setBoardDims()
    // hundreds of distinct tiles: keep their faces and carved tops cached instead of rebuilding them
    setFaceCacheLimit(480)
    setTopCacheLimit(480)
    this.appearance = { pieceSet: 'letters', pieceGuide: 'none', ...(compactRendering() ? { pieceFinish: 'insatsu' as const } : {}) }
    const { renderer, scene, camera } = this
    scene.background = new THREE.Color(0x1c1814)
    scene.fog = new THREE.Fog(0x1c1814, 150, 420)
    this.sun = this.addLights()
    this.addFloor()
    this.addBoard()
    scene.add(this.pieces, this.marks)

    this.tiles = {
      selected: this.tile(0xf0be3c, 0.55),
      inspected: this.tile(0x7850c8, 0.35),
      from: this.tile(0x4678c8, 0.3),
      to: this.tile(0x4678c8, 0.45),
    }
    const flat = (geometry: THREE.BufferGeometry) => geometry.rotateX(-Math.PI / 2).scale(1, 1, SQ_D)
    this.dots = this.instanced(flat(new THREE.CircleGeometry(0.17, 20)), 0x2f6118, 0.9)
    this.rings = this.instanced(flat(new THREE.RingGeometry(0.4, 0.5, 28)), 0xd23b25, 0.95)
    this.frames = this.instanced(flat(new THREE.RingGeometry(0.4, 0.5, 4, 1, Math.PI / 4)), 0xd99a1c, 0.95)

    const dom = renderer.domElement
    dom.style.cssText = 'display:block;width:100%;height:100%;touch-action:none'
    host.appendChild(dom)
    this.controls = new OrbitControls(camera, dom)
    this.controls.enableDamping = true
    this.controls.screenSpacePanning = false
    this.controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }
    this.controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE }
    this.controls.minDistance = 3
    this.controls.maxDistance = 130
    this.controls.maxPolarAngle = Math.PI * 0.48
    this.controls.addEventListener('change', () => (this.dirty = true))
    this.resetView(false)

    this.observer = new ResizeObserver(() => {
      this.size = { w: host.clientWidth, h: host.clientHeight }
    })
    this.observer.observe(host)
    this.size = { w: host.clientWidth, h: host.clientHeight }
    this.listen(dom, 'pointerdown', (e) => (this.down = { x: e.clientX, y: e.clientY, time: performance.now() }))
    this.listen(dom, 'pointerup', (e) => this.pointerUp(e))
    void this.loadFonts().then(() => {
      this.fontsReady = true
      this.dirty = true
    })
    this.loop()
  }

  // Faces are only cached once their font subset is loaded, so load every character the 400 tiles use up front.
  private async loadFonts() {
    const font = getSettings().pieceFont
    await loadPieceFont(font).catch(() => undefined)
    const chars = new Set<string>()
    for (const key of Object.keys(catalog)) for (const side of ['b', 'w'] as const) for (const ch of glyphOf(key, side)) chars.add(ch)
    const spec = PIECE_FONTS[font]
    await document.fonts.load(`${spec.weight} 100px "${spec.family}"`, [...chars].join('')).catch(() => undefined)
  }

  // --- building the room -------------------------------------------------

  private addLights() {
    const { scene } = this
    scene.add(new THREE.HemisphereLight(0xe8e0d0, 0x3a2a18, 1.05))
    const sun = new THREE.DirectionalLight(0xffe8c4, 1.7)
    sun.castShadow = true
    const mapSize = compactRendering() ? 1024 : 2048
    sun.shadow.mapSize.set(mapSize, mapSize)
    sun.shadow.camera.left = sun.shadow.camera.bottom = -17
    sun.shadow.camera.right = sun.shadow.camera.top = 17
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = 70
    sun.shadow.bias = -0.0004
    sun.shadow.normalBias = 0.02
    sun.shadow.autoUpdate = false
    scene.add(sun, sun.target)
    const fill = new THREE.DirectionalLight(0x8fa6d8, 0.35)
    fill.position.set(8, 6, -6)
    scene.add(fill)
    return sun
  }

  private addFloor() {
    const floor = new THREE.Mesh(
      tileUV(new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2), 900 / 34, 900 / 34),
      standard('planks-board', { map: planks(), roughness: 0.55 }, 0.24),
    )
    floor.position.y = -THICK - LEG
    floor.receiveShadow = true
    this.scene.add(floor)
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
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 1.4, LEG, 28), legMaterial)
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

  private tile(color: number, opacity: number) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, SQ_D).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -3,
        polygonOffsetUnits: -3,
      }),
    )
    mesh.position.y = 0.012
    mesh.visible = false
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
    const distance = Math.max((2 * HX + 5) / aspect, 2 * HZ + 5) / (2 * Math.tan((FOV * Math.PI) / 360))
    const angle = 0.3
    return { target: new THREE.Vector3(0, 0, 0), position: new THREE.Vector3(0, Math.cos(angle) * distance, Math.sin(angle) * distance) }
  }

  private resetView(animate: boolean) {
    this.moveTo(this.fitView(), animate)
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
    this.resetView(true)
  }

  focus(pos: Pos, cellPx = 40) {
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
    const color = cell.side === 'b' ? Color.BLACK : Color.WHITE
    const mesh = pieceMesh(
      PieceType.PAWN,
      color,
      hash(cell.key + cell.side),
      pieceSegments(),
      this.appearance,
      preparePieceEnvironment(this.renderer, false),
      false,
      { text: glyphOf(cell.key, cell.side), promoted: cell.key.startsWith('+'), code: cell.key, scale: tileScale(cell.key) },
    )
    mesh.userData.cell = cell
    return mesh
  }

  private place(mesh: THREE.Object3D, pos: Pos) {
    mesh.position.set(squareX(pos.file), 0, squareZ(pos.rank))
  }

  private retire(mesh: THREE.Object3D, fade: boolean) {
    if (fade) this.fades.push({ mesh, start: performance.now() })
    else this.drop(mesh)
  }

  private drop(mesh: THREE.Object3D) {
    this.pieces.remove(mesh)
    disposePiece(mesh, true)
  }

  private finishAnimations() {
    for (const t of this.tweens.splice(0)) {
      t.mesh.position.copy(t.to)
      t.done?.()
    }
    for (const f of this.fades.splice(0)) this.drop(f.mesh)
  }

  setPosition(snap: Snapshot, last: EngineMove | null) {
    this.finishAnimations()
    const grid = snap.grid
    const now = performance.now()
    const moving = last && !same(last.from, last.to) ? last : null
    let landing: Tween | null = null

    if (moving) {
      const mesh = this.cells.get(indexOf(moving.from))
      const target = grid[moving.to.rank - 1][moving.to.file - 1]
      if (mesh && target && (mesh.userData.cell as Cell).side === target.side) {
        const from = mesh.position.clone()
        const to = new THREE.Vector3(squareX(moving.to.file), 0, squareZ(moving.to.rank))
        const steps = Math.max(Math.abs(moving.from.file - moving.to.file), Math.abs(moving.from.rank - moving.to.rank) * SQ_D)
        const promoted = (mesh.userData.cell as Cell).key !== target.key
        landing = { mesh, from, to, start: now, duration: Math.min(620, 240 + steps * 28), arc: steps > 1.6 ? 0.9 : 0.35 }
        this.cells.delete(indexOf(moving.from))
        const captured = this.cells.get(indexOf(moving.to))
        if (captured) {
          this.cells.delete(indexOf(moving.to))
          this.retire(captured, true)
        }
        if (promoted) {
          // the old face stays up while the tile travels; the promoted face appears at landing
          landing.done = () => {
            this.drop(mesh)
            const fresh = this.make(target)
            this.place(fresh, moving.to)
            this.pieces.add(fresh)
            this.cells.set(indexOf(moving.to), fresh)
            this.shadowDirty = this.dirty = true
          }
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
        const promotionLanding = landing && !landing.done?.length && moving && same(moving.to, { file, rank }) && landing.done
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
    this.shadowDirty = this.dirty = true
  }

  private pump() {
    if (!this.pending.size || !this.fontsReady) return
    const target = this.controls.target
    const order = [...this.pending.entries()].sort(([a], [b]) => {
      const da = Math.hypot((a % SIZE) + 0.5 - HX - target.x, Math.floor(a / SIZE) + 0.5 - HX - target.z)
      const db = Math.hypot((b % SIZE) + 0.5 - HX - target.x, Math.floor(b / SIZE) + 0.5 - HX - target.z)
      return da - db
    })
    const started = performance.now()
    for (const [idx, cell] of order) {
      // a long first build hands control back to input every frame
      if (performance.now() - started > 16) break
      this.pending.delete(idx)
      const mesh = this.make(cell)
      this.place(mesh, { file: (idx % SIZE) + 1, rank: Math.floor(idx / SIZE) + 1 })
      this.pieces.add(mesh)
      this.cells.set(idx, mesh)
    }
    this.callbacks.onProgress(this.total - this.pending.size, this.total)
    if (!this.pending.size) this.total = 0
    this.shadowDirty = this.dirty = true
  }

  // --- marks -------------------------------------------------------------

  setMarks({ selected, inspected, targets, last }: Marks) {
    const put = (mesh: THREE.Mesh, pos: Pos | null) => {
      mesh.visible = !!pos
      if (pos) mesh.position.set(squareX(pos.file), mesh.position.y, squareZ(pos.rank))
    }
    put(this.tiles.selected, selected)
    put(this.tiles.inspected, inspected)
    put(this.tiles.from, last?.from ?? null)
    put(this.tiles.to, last && !same(last.from, last.to) ? last.to : null)
    const counts = { step: 0, capture: 0, via: 0 }
    const meshes = { step: this.dots, capture: this.rings, via: this.frames }
    const m = new THREE.Matrix4()
    targets.forEach((kind, key) => {
      const mesh = meshes[kind]
      if (counts[kind] >= MAX_TARGETS) return
      const [file, rank] = key.split(',').map(Number)
      m.makeTranslation(squareX(file), 0, squareZ(rank))
      mesh.setMatrixAt(counts[kind]++, m)
    })
    for (const kind of ['step', 'capture', 'via'] as const) {
      meshes[kind].count = counts[kind]
      meshes[kind].instanceMatrix.needsUpdate = true
    }
    this.dirty = true
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
    const hit = new THREE.Vector3()
    // aim at the middle of a standing tile rather than the board, so tall tiles are hit where they look
    if (!this.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.3), hit)) return
    const pos = { file: fileAt(hit.x), rank: rankAt(hit.z) }
    if (pos.file >= 1 && pos.file <= SIZE && pos.rank >= 1 && pos.rank <= SIZE) this.callbacks.onCell(pos)
  }

  // --- loop --------------------------------------------------------------

  private loop = () => {
    if (this.disposed) return
    this.frame = requestAnimationFrame(this.loop)
    const now = performance.now()
    const { renderer, camera, controls } = this
    if (
      this.size &&
      (this.size.w !== renderer.domElement.clientWidth ||
        renderer.getSize(new THREE.Vector2()).x !== this.size.w ||
        renderer.getSize(new THREE.Vector2()).y !== this.size.h)
    ) {
      const { w, h } = this.size
      if (w > 0 && h > 0) {
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
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
    controls.update()
    this.keepOnBoard()
    this.animate(now)
    this.pump()
    if (!this.dirty) return
    // while the first 800 tiles are still being built, repaint at each quarter instead of every frame
    if (this.pending.size && this.total) {
      const built = 1 - this.pending.size / this.total
      if (built < this.shown + 0.25) return
      this.shown = built
    } else this.shown = -1
    this.dirty = false
    this.followSun()
    renderer.render(this.scene, camera)
  }

  private keepOnBoard() {
    const t = this.controls.target
    const x = Math.max(-HX, Math.min(HX, t.x))
    const z = Math.max(-HZ, Math.min(HZ, t.z))
    if (x !== t.x || z !== t.z) {
      this.camera.position.x += x - t.x
      this.camera.position.z += z - t.z
      t.x = x
      t.z = z
    }
    t.y = 0
  }

  private animate(now: number) {
    if (this.tweens.length || this.fades.length) this.dirty = this.shadowDirty = true
    this.tweens = this.tweens.filter((t) => {
      const k = Math.min(1, Math.max(0, (now - t.start) / t.duration))
      t.mesh.position.lerpVectors(t.from, t.to, ease(k))
      t.mesh.position.y = Math.sin(Math.PI * k) * t.arc
      if (k < 1) return true
      t.mesh.position.copy(t.to)
      playSound('move')
      t.done?.()
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

  // the shadow window follows what the camera looks at and only re-renders when something changed
  private followSun() {
    const target = this.controls.target
    if (this.shadowTarget.distanceTo(target) > 4) this.shadowDirty = true
    if (!this.shadowDirty) return
    this.shadowTarget.copy(target)
    this.sun.target.position.copy(target)
    this.sun.position.set(target.x - 5, 26, target.z + 8)
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
    const dom = this.renderer.domElement
    dom.remove()
    this.cells.clear()
    this.pending.clear()
    disposeScene(this.scene)
    disposeRenderer(this.renderer)
  }
}
