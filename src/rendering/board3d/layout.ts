import * as THREE from 'three'
import { Color } from 'tsshogi'
import { HALF_D, HALF_W, STAND, STAND_TOP, STRIP_D } from './dimensions'
import { sideStandsFit } from './dimensions'
export { sideStandsFit }
import type { Latest, SceneState, StandZones } from './types'

export const layout = { portrait: false, narrow: false }

export const stripZ = () => HALF_D + 0.25 + STRIP_D / 2

export function standCenter(color: Color) {
  const sign = color === Color.BLACK ? 1 : -1
  return layout.portrait
    ? new THREE.Vector3(0, STAND_TOP, sign * stripZ())
    : new THREE.Vector3(sign * (HALF_W + 0.4 + STAND / 2), STAND_TOP, sign * (HALF_D - STAND / 2))
}

export function cameraFit(aspect: number, tilt: number, sideRoom: number, portrait = layout.portrait, narrow = layout.narrow) {
  return cameraFitFor(aspect, tilt, sideRoom, { halfW: HALF_W, halfD: HALF_D, stand: STAND, stripD: STRIP_D, stripZ: stripZ() }, portrait, narrow)
}

export function cameraFitFor(
  aspect: number,
  tilt: number,
  sideRoom: number,
  dims: { halfW: number; halfD: number; stand: number; stripD: number; stripZ: number },
  portrait = false,
  narrow = false,
) {
  const fit = portrait
    ? Math.max((2 * dims.halfW + (narrow ? 0.5 : 1.0)) / aspect, 2 * (dims.stripZ + dims.stripD / 2) + 0.2)
    : Math.max((2 * (dims.halfW + 0.45 + Math.max(dims.stand, sideRoom)) + 1.4) / aspect, 2 * dims.halfD + 1.6)
  return fit * (1 + (portrait ? 0.06 : 0.16) * tilt)
}

export function zoneReporter(s: SceneState, latest: Latest) {
  return projectedZoneReporter({
    renderer: s.renderer,
    camera: s.camera,
    onZones: () => latest.current.onZones,
    ready: () => !s.flip && Math.abs((latest.current.flipped ? Math.PI : 0) - s.root.rotation.y) <= 0.002,
    sideRoom: () => latest.current.sideRoom ?? 0,
    inputs: () => [...s.board.matrixWorld.elements, ...s.stands.flatMap(({ stand }) => stand.matrixWorld.elements)],
    fits: sideStandsFit,
    fit: (aspect, sideRoom, narrow) => cameraFit(aspect, 0, sideRoom, false, narrow),
    board: () => new THREE.Box3().setFromObject(s.board),
    stands: () =>
      [-1, 1].map((sign) => {
        const x = sign * (HALF_W + 0.4 + STAND / 2)
        const z = sign * (HALF_D - STAND / 2)
        return new THREE.Box3(new THREE.Vector3(x - STAND / 2, STAND_TOP, z - STAND / 2), new THREE.Vector3(x + STAND / 2, STAND_TOP, z + STAND / 2))
      }),
    obstacles: () => [s.board, ...s.stands.map(({ stand }) => stand)].map((object) => new THREE.Box3().setFromObject(object)),
  })
}

type ZoneProjection = {
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  onZones: () => ((zones: StandZones | null) => void) | undefined
  ready: () => boolean
  sideRoom: () => number
  inputs: () => number[]
  fits: (width: number, height: number) => boolean
  fit: (aspect: number, sideRoom: number, narrow: boolean) => number
  board: () => THREE.Box3
  stands: () => THREE.Box3[]
  obstacles: () => THREE.Box3[]
}

export function projectedZoneReporter(options: ZoneProjection) {
  let zoneKey = ''
  let previous: number[] = []
  let previousCallback: ReturnType<ZoneProjection['onZones']>
  const camera = options.camera.clone()
  const box = (b: THREE.Box3, w: number, h: number) => {
    const xs: number[] = []
    const ys: number[] = []
    for (const x of [b.min.x, b.max.x])
      for (const z of [b.min.z, b.max.z]) {
        const p = new THREE.Vector3(x, b.max.y, z).project(camera)
        xs.push(((p.x + 1) / 2) * w)
        ys.push(((1 - p.y) / 2) * h)
      }
    return { l: Math.min(...xs), r: Math.max(...xs), t: Math.min(...ys), b: Math.max(...ys) }
  }
  return () => {
    const cb = options.onZones()
    if (!cb) return
    if (cb !== previousCallback) {
      previousCallback = cb
      previous = []
      zoneKey = ''
    }
    if (!options.ready()) return
    const canvas = options.renderer.domElement
    const shell = canvas.closest('.app-shell')
    const docked = shell && !shell.matches('.zoned, .panel-hidden, .fs') ? shell.querySelector<HTMLElement>(':scope > .app-panel') : null
    const w = canvas.clientWidth + (docked?.offsetWidth ?? 0)
    const h = canvas.clientHeight
    const rect = canvas.getBoundingClientRect()
    const scene = canvas.closest('.app-board-scene')
    const captions = Array.from(scene?.querySelectorAll<HTMLElement>('.app-plate.top, .app-board-caption') ?? [])
      .map((element) => element.getBoundingClientRect())
      .filter((bounds) => bounds.width && bounds.height)
    const inputs = [
      w,
      h,
      rect.left,
      rect.top,
      +!!docked,
      ...captions.flatMap((bounds) => [bounds.left, bounds.top, bounds.right, bounds.bottom]),
      options.sideRoom(),
      ...options.camera.matrixWorld.elements,
      ...options.camera.projectionMatrix.elements,
      ...options.inputs(),
    ]
    if (inputs.length === previous.length && inputs.every((value, index) => value === previous[index])) return
    previous = inputs
    if (!options.fits(w, h)) {
      if (zoneKey !== 'none') {
        zoneKey = 'none'
        cb(null)
      }
      return
    }
    camera.aspect = w / h
    camera.fov = options.camera.fov
    const distance = options.fit(camera.aspect, options.sideRoom(), w < 560) / (2 * Math.tan((camera.fov * Math.PI) / 360))
    camera.position.set(0, distance, distance * 0.02)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
    const bd = box(options.board(), w, h)
    const [a, c] = options.stands().map((bounds) => box(bounds, w, h))
    const top = a.t < c.t ? a : c
    const bottom = a.t < c.t ? c : a
    const gap = 12
    const W = Math.max(0, Math.min(bd.l - gap - 16, w - 16 - bd.r - gap))
    const H = Math.max(0, Math.min(h - 48 - top.b - gap, bottom.t - gap - 48))
    const bar = 0
    const underW = Math.max(0, W - bar)
    const zones: StandZones = {
      floatingAvailable: W >= 280 && H >= 240,
      board: { left: rect.left + bd.l, top: rect.top + bd.t, width: bd.r - bd.l, height: bd.b - bd.t },
      under: { left: rect.left + bd.l - gap - bar - underW, top: rect.top + top.b + gap, width: underW, height: H },
      over: { left: rect.left + bd.r + gap, top: rect.top + bottom.t - gap - H, width: W, height: H },
    }
    if (!docked && zones.floatingAvailable) {
      const obstacles = options.obstacles().map((bounds) => {
        const points = [bounds.min.x, bounds.max.x].flatMap((x) =>
          [bounds.min.y, bounds.max.y].flatMap((y) => [bounds.min.z, bounds.max.z].map((z) => new THREE.Vector3(x, y, z).project(options.camera))),
        )
        return {
          left: rect.left + Math.min(...points.map((p) => ((p.x + 1) / 2) * w)),
          right: rect.left + Math.max(...points.map((p) => ((p.x + 1) / 2) * w)),
          top: rect.top + Math.min(...points.map((p) => ((1 - p.y) / 2) * h)),
          bottom: rect.top + Math.max(...points.map((p) => ((1 - p.y) / 2) * h)),
        }
      })
      obstacles.push(...captions.map(({ left, right, top, bottom }) => ({ left, right, top, bottom })))
      for (const zone of [zones.under, zones.over]) {
        const left = zone === zones.under
        let spaces = [
          { left: rect.left + (left ? 16 : w / 2 + gap), right: rect.left + (left ? w / 2 - gap : w - 16), top: rect.top + 48, bottom: rect.top + h - 48 },
        ]
        for (const obstacle of obstacles) {
          spaces = spaces.flatMap((space) => {
            const left = obstacle.left - gap
            const right = obstacle.right + gap
            const top = obstacle.top - gap
            const bottom = obstacle.bottom + gap
            if (right <= space.left || left >= space.right || bottom <= space.top || top >= space.bottom) return [space]
            return [
              { ...space, right: Math.min(space.right, left) },
              { ...space, left: Math.max(space.left, right) },
              { ...space, bottom: Math.min(space.bottom, top) },
              { ...space, top: Math.max(space.top, bottom) },
            ].filter((part) => part.right - part.left >= 180 && part.bottom - part.top >= 120)
          })
        }
        const area = (space: (typeof spaces)[number]) => (space.right - space.left) * (space.bottom - space.top)
        const available = spaces.sort((a, b) => area(b) - area(a))[0]
        if (available) {
          zone.left = available.left
          zone.top = available.top
          zone.width = available.right - available.left
          zone.height = available.bottom - available.top
        } else {
          zone.width = 0
          zone.height = 0
        }
      }
    }

    const key = [zones.under, zones.over].map((r) => [r.left, r.top, r.width, r.height].map((v) => Math.round(v * 100) / 100).join(',')).join('|')
    if (key === zoneKey) return
    zoneKey = key
    cb(zones)
  }
}
