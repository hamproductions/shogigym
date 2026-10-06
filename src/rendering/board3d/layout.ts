import * as THREE from 'three'
import { Color } from 'tsshogi'
import { HALF_D, HALF_W, STAND, STAND_TOP, STRIP_D } from './dimensions'
export { sideStandsFit } from './dimensions'
import type { Latest, SceneState, StandZones } from './types'

export const layout = { portrait: false, narrow: false }

export const stripZ = () => HALF_D + 0.25 + STRIP_D / 2

export function standCenter(color: Color) {
  const sign = color === Color.BLACK ? 1 : -1
  return layout.portrait
    ? new THREE.Vector3(0, STAND_TOP, sign * stripZ())
    : new THREE.Vector3(sign * (HALF_W + 0.4 + STAND / 2), STAND_TOP, sign * (HALF_D - STAND / 2))
}

export function cameraFit(aspect: number, tilt: number, sideRoom: number) {
  const fit = layout.portrait
    ? Math.max((2 * HALF_W + (layout.narrow ? 0.5 : 1)) / aspect, 2 * (stripZ() + STRIP_D / 2) + 0.2)
    : Math.max((2 * (HALF_W + 0.45 + Math.max(STAND, sideRoom)) + 1.4) / aspect, 2 * HALF_D + 1.6)
  return fit * (1 + (layout.portrait ? 0.06 : 0.16) * tilt)
}

export function zoneReporter(s: SceneState, latest: Latest) {
  let zoneKey = ''
  const box = (obj: THREE.Object3D, w: number, h: number) => {
    const b = new THREE.Box3().setFromObject(obj)
    const xs: number[] = []
    const ys: number[] = []
    for (const x of [b.min.x, b.max.x])
      for (const z of [b.min.z, b.max.z]) {
        const p = new THREE.Vector3(x, b.max.y, z).project(s.camera)
        xs.push(((p.x + 1) / 2) * w)
        ys.push(((1 - p.y) / 2) * h)
      }
    return { l: Math.min(...xs), r: Math.max(...xs), t: Math.min(...ys), b: Math.max(...ys) }
  }
  return () => {
    const cb = latest.current.onZones
    if (!cb) return
    if (Math.abs(s.tilt - s.tiltTarget) > 0.002 || s.flip) return
    if (Math.abs((latest.current.flipped ? Math.PI : 0) - s.root.rotation.y) > 0.002) return
    if (layout.portrait) {
      if (zoneKey !== 'none') {
        zoneKey = 'none'
        cb(null)
      }
      return
    }
    const canvas = s.renderer.domElement
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    const bd = box(s.board, w, h)
    const [a, c] = s.stands.map(({ stand }) => box(stand, w, h))
    const top = a.t < c.t ? a : c
    const bottom = a.t < c.t ? c : a
    const rect = canvas.getBoundingClientRect()
    const gap = 12
    const W = Math.max(0, Math.min(bd.l - gap - 16, w - 16 - bd.r - gap))
    const H = Math.max(0, Math.min(h - 48 - top.b - gap, bottom.t - gap - 48))
    const bar = 0
    const underW = Math.max(0, W - bar)
    const zones: StandZones = {
      board: { left: rect.left + bd.l, top: rect.top + bd.t, width: bd.r - bd.l, height: bd.b - bd.t },
      under: { left: rect.left + bd.l - gap - bar - underW, top: rect.top + top.b + gap, width: underW, height: H },
      over: { left: rect.left + bd.r + gap, top: rect.top + bottom.t - gap - H, width: W, height: H },
    }
    const key = [zones.under, zones.over].map((r) => [r.left, r.top, r.width, r.height].map((v) => Math.round(v / 6)).join(',')).join('|')
    if (key === zoneKey) return
    zoneKey = key
    cb(zones)
  }
}
