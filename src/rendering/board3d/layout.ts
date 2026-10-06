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
  const fit = portrait
    ? Math.max((2 * HALF_W + (narrow ? 0.5 : 1.0)) / aspect, 2 * (stripZ() + STRIP_D / 2) + 0.2)
    : Math.max((2 * (HALF_W + 0.45 + Math.max(STAND, sideRoom)) + 1.4) / aspect, 2 * HALF_D + 1.6)
  return fit * (1 + (portrait ? 0.06 : 0.16) * tilt)
}

export function zoneReporter(s: SceneState, latest: Latest) {
  let zoneKey = ''
  const camera = s.camera.clone()
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
    const cb = latest.current.onZones
    if (!cb) return
    if (s.flip) return
    if (Math.abs((latest.current.flipped ? Math.PI : 0) - s.root.rotation.y) > 0.002) return
    const canvas = s.renderer.domElement
    const shell = canvas.closest('.app-shell')
    const docked = shell && !shell.matches('.zoned, .panel-hidden, .fs') ? shell.querySelector<HTMLElement>(':scope > .app-panel') : null
    const w = canvas.clientWidth + (docked?.offsetWidth ?? 0)
    const h = canvas.clientHeight
    if (!sideStandsFit(w, h)) {
      if (zoneKey !== 'none') {
        zoneKey = 'none'
        cb(null)
      }
      return
    }
    camera.aspect = w / h
    const distance = cameraFit(camera.aspect, 0, latest.current.sideRoom ?? 0, false, w < 560) / (2 * Math.tan((camera.fov * Math.PI) / 360))
    camera.position.set(0, distance, distance * 0.02)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
    const bd = box(new THREE.Box3().setFromObject(s.board), w, h)
    const [a, c] = [-1, 1].map((sign) => {
      const x = sign * (HALF_W + 0.4 + STAND / 2)
      const z = sign * (HALF_D - STAND / 2)
      return box(new THREE.Box3(new THREE.Vector3(x - STAND / 2, STAND_TOP, z - STAND / 2), new THREE.Vector3(x + STAND / 2, STAND_TOP, z + STAND / 2)), w, h)
    })
    const top = a.t < c.t ? a : c
    const bottom = a.t < c.t ? c : a
    const rect = canvas.getBoundingClientRect()
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
      const obstacles = [s.board, ...s.stands.map(({ stand }) => stand)].map((object) => {
        const bounds = new THREE.Box3().setFromObject(object)
        const points = [bounds.min.x, bounds.max.x].flatMap((x) =>
          [bounds.min.y, bounds.max.y].flatMap((y) => [bounds.min.z, bounds.max.z].map((z) => new THREE.Vector3(x, y, z).project(s.camera))),
        )
        return {
          left: rect.left + Math.min(...points.map((p) => ((p.x + 1) / 2) * w)),
          right: rect.left + Math.max(...points.map((p) => ((p.x + 1) / 2) * w)),
          top: rect.top + Math.min(...points.map((p) => ((1 - p.y) / 2) * h)),
          bottom: rect.top + Math.max(...points.map((p) => ((1 - p.y) / 2) * h)),
        }
      })
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
