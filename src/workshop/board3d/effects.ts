import * as THREE from 'three'
import { SNAPSHOT_NAME } from '../lib/events'
import { CASUAL_ROOM, ROOM_H, TABLE, TABLE_H, TRADITIONAL_ROOM, ZABUTON, mm } from '../roomMetrics'
import { playSound } from '../settings'
import { CASUAL, FLAT, HALF_D, HALF_W, LEG, THICK } from './dimensions'
import { layout } from './layout'
import type { Wall } from '../avatars'
import type { Arena, Body, Dust, SceneState, TableFlip } from './types'

const GRAVITY = 34
const SLAM = 0.72
const DURATION = 4
const DUST = 320

const random = (spread: number) => (Math.random() - 0.5) * spread
const tmpQ = new THREE.Quaternion()
const tmpV = new THREE.Vector3()
const basis = new THREE.Matrix4()
const axes = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]

const block = (x: number, z: number, hx: number, hz: number, top: number) => ({ minX: x - hx, maxX: x + hx, minZ: z - hz, maxZ: z + hz, top })

function arena(): Arena {
  if (CASUAL) {
    const top = -THICK
    const floor = top - TABLE_H
    const seat = mm(440)
    const chairs = [1, -1].flatMap((side) => {
      const cz = side * (TABLE.halfD + seat / 2 - 2)
      return [block(0, cz, seat / 2, seat / 2, floor + seat + 0.8), block(0, cz + side * (seat / 2 - 0.7), seat / 2, 0.5, floor + seat + mm(420))]
    })
    const things = [block(12.2, 8.6, 1.8, 1.8, top + 2.85), block(-12.2, -8.6, 1.8, 1.8, top + 2.85), block(12.4, -7.6, 3.6, 3.6, top + 0.5), block(-12.4, 7.6, 3.9, 3.9, top + 3.4)]
    const lamp: Wall = { minX: -mm(200), maxX: mm(200), minZ: -mm(200), maxZ: mm(200), minY: top + mm(560), maxY: floor + ROOM_H }
    return { floor, boxes: [block(0, 0, TABLE.halfW, TABLE.halfD, top), ...chairs, ...things], ...CASUAL_ROOM, ceil: floor + ROOM_H, walls: [lamp] }
  }
  const floor = -THICK - LEG
  if (FLAT) return { floor, boxes: [], halfX: Infinity, halfZ: Infinity, ceil: Infinity, walls: [] }
  const seats = [1, -1].flatMap((sign) => {
    const z = sign * (HALF_D + ZABUTON.gap)
    const tray = { x: sign * 15.5, z: sign * (HALF_D + 10) }
    return [
      block(0, z, ZABUTON.w / 2, ZABUTON.d / 2, floor + ZABUTON.h),
      block(-sign * 13.5, z + sign, 1.7, mm(225), floor + mm(300)),
      block(tray.x, tray.z, 4.55, 4.55, floor + 0.75),
      block(tray.x - sign * 1.6, tray.z - sign * 1.2, 2.2, 2.2, floor + 4.1),
      block(tray.x + sign * 1.8, tray.z + sign * 1.6, 1.15, 1.15, floor + 3.1),
    ]
  })
  return { floor, boxes: seats, ...TRADITIONAL_ROOM, ceil: floor + ROOM_H, walls: [] }
}

function surface(a: Arena, x: number, z: number) {
  let top = a.floor
  for (const b of a.boxes) if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ) top = Math.max(top, b.top)
  return top
}

function footprintSurface(a: Arena, c: THREE.Vector3, e: THREE.Vector3) {
  return Math.max(surface(a, c.x - e.x, c.z - e.z), surface(a, c.x + e.x, c.z - e.z), surface(a, c.x - e.x, c.z + e.z), surface(a, c.x + e.x, c.z + e.z))
}

function dustCloud(): Dust {
  const position = new Float32Array(DUST * 3).fill(-1e4)
  const color = new Float32Array(DUST * 3)
  const velocity = new Float32Array(DUST * 3)
  const life = new Float32Array(DUST)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(color, 3))
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.32, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false }))
  points.frustumCulled = false
  let next = 0
  return {
    points,
    burst: (at, count, power) => {
      for (let n = 0; n < count; n++) {
        const i = next
        next = (next + 1) % DUST
        const splinter = Math.random() < 0.35
        position.set([at.x + random(1.2), at.y + 0.1, at.z + random(1.2)], i * 3)
        velocity.set([random(power * 2), (0.3 + Math.random()) * power * (splinter ? 1.3 : 0.7), random(power * 2)], i * 3)
        color.set(splinter ? [0.55, 0.34, 0.16] : [0.82, 0.74, 0.6], i * 3)
        life[i] = splinter ? 0.9 + Math.random() * 0.6 : 0.6 + Math.random() * 0.9
      }
      geometry.attributes.color.needsUpdate = true
    },
    step: (dt) => {
      for (let i = 0; i < DUST; i++) {
        if (life[i] <= 0) continue
        life[i] -= dt
        if (life[i] <= 0) {
          position[i * 3 + 1] = -1e4
          continue
        }
        velocity[i * 3 + 1] -= 12 * dt
        for (let k = 0; k < 3; k++) {
          velocity[i * 3 + k] *= Math.exp(-dt * 2.5)
          position[i * 3 + k] += velocity[i * 3 + k] * dt
        }
      }
      geometry.attributes.position.needsUpdate = true
    },
  }
}

function body(obj: THREE.Object3D, v: THREE.Vector3, w: THREE.Vector3, keepFlat: boolean): Body {
  const geometry = (obj as THREE.Mesh).geometry
  const box = geometry && !(obj as THREE.Sprite).isSprite ? (geometry.boundingBox ?? (geometry.computeBoundingBox(), geometry.boundingBox!)) : new THREE.Box3(new THREE.Vector3(-0.15, -0.15, -0.15), new THREE.Vector3(0.15, 0.15, 0.15))
  const center = box.getCenter(new THREE.Vector3())
  const half = box.getSize(new THREE.Vector3()).multiplyScalar(0.5).multiply(obj.scale)
  return { obj, v, w, center, half, keepFlat, grounded: false, landed: false }
}

function orient(b: Body) {
  basis.makeRotationFromQuaternion(b.obj.quaternion).extractBasis(axes[0], axes[1], axes[2])
  const center = b.center.clone().multiply(b.obj.scale).applyQuaternion(b.obj.quaternion).add(b.obj.position)
  const extent = new THREE.Vector3()
  for (const k of ['x', 'y', 'z'] as const) extent[k] = Math.abs(axes[0][k]) * b.half.x + Math.abs(axes[1][k]) * b.half.y + Math.abs(axes[2][k]) * b.half.z
  return { center, extent }
}

function settle(b: Body, dt: number) {
  const index = b.keepFlat ? 1 : [0, 1, 2].reduce((best, k) => (Math.abs(axes[k].y) > Math.abs(axes[best].y) ? k : best), 1)
  const axis = axes[index]
  tmpQ.setFromUnitVectors(axis, tmpV.set(0, Math.sign(axis.y) || 1, 0)).multiply(b.obj.quaternion)
  b.obj.quaternion.slerp(tmpQ, 1 - Math.exp(-dt * 9))
  b.v.x *= Math.exp(-dt * 5)
  b.v.z *= Math.exp(-dt * 5)
  b.w.multiplyScalar(Math.exp(-dt * 7))
}

function boardMatrix(f: TableFlip, s: SceneState) {
  return new THREE.Matrix4().multiplyMatrices(f.rig.matrix, s.board.matrix)
}

function pushOutOfBoard(b: Body, c: THREE.Vector3, m: THREE.Matrix4, inverse: THREE.Matrix4, kick: number) {
  const local = c.clone().applyMatrix4(inverse)
  const limits = new THREE.Vector3(HALF_W + 0.12, THICK / 2 + 0.12, HALF_D + 0.12)
  const depth = new THREE.Vector3(limits.x - Math.abs(local.x), limits.y - Math.abs(local.y), limits.z - Math.abs(local.z))
  if (depth.x <= 0 || depth.y <= 0 || depth.z <= 0) return
  const k = depth.x < depth.y && depth.x < depth.z ? 'x' : depth.y < depth.z ? 'y' : 'z'
  local[k] = Math.sign(local[k] || 1) * limits[k]
  const moved = local.applyMatrix4(m)
  b.obj.position.add(moved.sub(c))
  const n = new THREE.Vector3().setFromMatrixColumn(m, k === 'x' ? 0 : k === 'y' ? 1 : 2).normalize().multiplyScalar(Math.sign(c.clone().applyMatrix4(inverse)[k] || 1))
  const vn = b.v.dot(n)
  if (vn < 0) b.v.addScaledVector(n, -1.2 * vn)
  b.v.addScaledVector(n, kick)
  if (b.v.length() > 32) b.v.setLength(32)
}

function stepBody(b: Body, f: TableFlip, dt: number, board: { m: THREE.Matrix4; inverse: THREE.Matrix4; kick: number }) {
  const a = f.arena
  const before = b.obj.position.clone()
  b.v.y -= GRAVITY * dt
  b.obj.position.addScaledVector(b.v, dt)
  const angle = b.w.length() * dt
  if (angle) b.obj.quaternion.premultiply(tmpQ.setFromAxisAngle(tmpV.copy(b.w).normalize(), angle))
  let { center: c, extent: e } = orient(b)
  pushOutOfBoard(b, c, board.m, board.inverse, board.kick)
  ;({ center: c, extent: e } = orient(b))
  for (const k of ['x', 'z'] as const) {
    const limit = k === 'x' ? a.halfX : a.halfZ
    const over = Math.abs(c[k]) + e[k] - limit
    if (over > 0) {
      b.obj.position[k] -= Math.sign(c[k]) * over
      b.v[k] = -Math.sign(c[k]) * Math.abs(b.v[k]) * 0.5
    }
  }
  for (const wall of a.walls) {
    const lo = { x: wall.minX, y: wall.minY ?? -Infinity, z: wall.minZ }
    const hi = { x: wall.maxX, y: wall.maxY ?? Infinity, z: wall.maxZ }
    const depth = (k: 'x' | 'y' | 'z') => Math.min(c[k] + e[k] - lo[k], hi[k] - (c[k] - e[k]))
    const free = (['x', 'y', 'z'] as const).filter((k) => Number.isFinite(lo[k] + hi[k]))
    if ((['x', 'y', 'z'] as const).some((k) => depth(k) <= 0)) continue
    const k = free.reduce((best, axis) => (depth(axis) < depth(best) ? axis : best))
    const out = c[k] < (lo[k] + hi[k]) / 2 ? -1 : 1
    b.obj.position[k] += out * depth(k)
    b.v[k] = out * Math.abs(b.v[k]) * 0.4
  }
  if (c.y + e.y > a.ceil) {
    b.obj.position.y -= c.y + e.y - a.ceil
    b.v.y = -Math.abs(b.v.y) * 0.4
  }
  ;({ center: c, extent: e } = orient(b))
  let ground = footprintSurface(a, c, e)
  if (ground - (c.y - e.y) > 0.8) {
    b.obj.position.x = before.x
    b.obj.position.z = before.z
    b.v.x *= -0.4
    b.v.z *= -0.4
    ;({ center: c, extent: e } = orient(b))
    ground = footprintSurface(a, c, e)
  }
  const bottom = c.y - e.y
  b.grounded = bottom <= ground + 0.002
  if (bottom >= ground) return 0
  b.obj.position.y += ground - bottom
  if (b.v.y >= 0) return 0
  const impact = -b.v.y
  b.v.y = impact > 3 ? impact * 0.36 : 0
  b.v.x *= 0.72
  b.v.z *= 0.72
  b.w.multiplyScalar(0.6)
  return impact
}

function launchPieces(s: SceneState): Body[] {
  return s.pieces.children.map((m) => {
    const obj = m.clone()
    obj.position.copy(m.position)
    s.root.add(obj)
    const dir = new THREE.Vector3(m.position.x, 0, m.position.z).normalize()
    const rocket = Math.random() < 0.12
    const speed = rocket ? 18 + Math.random() * 14 : 4 + Math.random() * 9
    const v = new THREE.Vector3(dir.x * speed, rocket ? 62 + Math.random() * 8 : 12 + Math.random() * 18, dir.z * speed - 3 - Math.random() * 6)
    return body(obj, v, new THREE.Vector3(random(70), random(70), random(70)), true)
  })
}

function launchStands(s: SceneState): Body[] {
  return s.stands.flatMap(({ stand, side, legs }) =>
    [stand, ...legs]
      .filter((m) => m.visible)
      .map((m, i) => {
        const v = layout.portrait ? new THREE.Vector3(random(8), 16 + Math.random() * 6, side * (12 + Math.random() * 6)) : new THREE.Vector3(side * (10 + Math.random() * 8 + i * 2), 14 + Math.random() * 8, -4 - Math.random() * 6)
        return body(m, v, new THREE.Vector3(random(14), random(10), random(14)), false)
      }),
  )
}

export function startTableFlip(s: SceneState) {
  if (s.flip) return
  const rig = new THREE.Group()
  s.root.add(rig)
  rig.add(s.board, ...s.legs)
  const dust = dustCloud()
  s.root.add(dust.points)
  const bodies = [...launchPieces(s), ...launchStands(s)]
  s.pieces.visible = false
  s.marks.visible = false
  s.flip = { start: performance.now(), bodies, arena: { ...arena(), walls: s.avatars?.walls() ?? [] }, rig, dust, slammed: false, lastClatter: 0 }
  dust.burst(new THREE.Vector3(0, 0, HALF_D), 40, 6)
  playSound('bang')
}

function poseBoard(f: TableFlip, t: number) {
  const pivot = new THREE.Vector3(0, CASUAL ? -THICK : -THICK - LEG, CASUAL ? -HALF_D / 3 : -HALF_D)
  const u = Math.min(1, Math.max(0, (t - 0.04) / (SLAM - 0.04)))
  const k = (t - SLAM) / 0.45
  const angle = Math.PI * Math.pow(u, 1.35) - (k > 0 && k < 1 ? 0.24 * Math.sin(Math.PI * k) * (1 - k) : 0)
  f.rig.rotation.set(-angle, 0, 0)
  f.rig.position.copy(pivot).sub(pivot.clone().applyEuler(f.rig.rotation))
  f.rig.position.y += 5.5 * Math.sin(Math.PI * Math.min(1, t / SLAM))
  f.rig.updateMatrix()
  const low = CASUAL ? -THICK : -THICK - LEG
  const mid = new THREE.Vector3(0, low / 2, 0).applyMatrix4(f.rig.matrix)
  const corners = [-HALF_W, HALF_W].flatMap((x) => [-HALF_D, HALF_D].map((z) => new THREE.Vector3(x, 0, z).applyMatrix4(f.rig.matrix)))
  const ground = CASUAL ? surface(f.arena, mid.x, mid.z) : Math.max(...[mid, ...corners].map((p) => surface(f.arena, p.x, p.z)))
  let lift = -Infinity
  for (const x of [-HALF_W, HALF_W])
    for (const y of [low, 0])
      for (const z of [-HALF_D, HALF_D]) {
        const p = new THREE.Vector3(x, y, z).applyMatrix4(f.rig.matrix)
        lift = Math.max(lift, ground - p.y)
      }
  f.rig.position.y += t >= SLAM ? lift : Math.max(0, lift)
  f.rig.updateMatrix()
}

export function stepTableFlip(s: SceneState, time: number, dt: number, done: () => void) {
  const f = s.flip
  if (!f) return
  const t = (time - f.start) / 1000
  poseBoard(f, t)
  if (!f.slammed && t >= SLAM) {
    f.slammed = true
    playSound('bang')
    for (const x of [-HALF_W, 0, HALF_W])
      for (const z of [-HALF_D, HALF_D]) {
        const p = new THREE.Vector3(x, 0, z).applyMatrix4(f.rig.matrix)
        f.dust.burst(p.setY(surface(f.arena, p.x, p.z)), 18, 9)
      }
  }
  const m = boardMatrix(f, s)
  const board = { m, inverse: m.clone().invert(), kick: t < SLAM ? 1.5 : 0 }
  let impacts = 0
  for (const b of f.bodies) {
    const impact = stepBody(b, f, dt, board)
    if (impact > 7) {
      impacts++
      if (!b.landed && !b.keepFlat) f.dust.burst(orient(b).center.setY(b.obj.position.y), 24, 7)
      b.landed = true
    }
    if (b.grounded && b.v.y === 0) settle(b, dt)
  }
  if (impacts && time - f.lastClatter > 90) {
    f.lastClatter = time
    playSound('clatter')
  }
  f.dust.step(dt)
  if (t <= DURATION) return
  for (const b of f.bodies) b.obj.quaternion.identity()
  for (const b of f.bodies) if (b.keepFlat) b.obj.removeFromParent()
  f.rig.position.set(0, 0, 0)
  f.rig.rotation.set(0, 0, 0)
  s.root.add(s.board, ...s.legs)
  f.rig.removeFromParent()
  f.dust.points.removeFromParent()
  f.dust.points.geometry.dispose()
  s.placeStands()
  s.flip = null
  s.pieces.visible = true
  s.marks.visible = true
  done()
}

export function flipCameraOffset(s: SceneState, time: number) {
  const f = s.flip
  if (!f) return null
  const t = (time - f.start) / 1000
  const shake = Math.max(0, 1 - t / 1.1) * 1.3 + (t > SLAM ? 1.1 * Math.exp(-(t - SLAM) * 7) : 0)
  const punch = 0.2 * Math.sin(Math.PI * Math.min(1, t / 0.5)) * (t < 0.5 ? 1 : 0) + (t > SLAM ? 0.12 * Math.exp(-(t - SLAM) * 9) : 0)
  const target = s.controls ? s.controls.target : new THREE.Vector3()
  return target.clone().sub(s.camera.position).multiplyScalar(punch).add(new THREE.Vector3(random(shake), random(shake), random(shake)))
}

export function saveSnapshot(s: SceneState, name: string) {
  s.renderer.render(s.scene, s.camera)
  const a = document.createElement('a')
  a.href = s.renderer.domElement.toDataURL('image/png')
  a.download = `${name || SNAPSHOT_NAME}.png`
  a.click()
}
