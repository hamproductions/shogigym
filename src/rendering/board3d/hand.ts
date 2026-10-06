import * as THREE from 'three'
import { Color, PieceType, type ImmutablePosition } from 'tsshogi'
import { HAND_ORDER } from '@/utils/shogi'
import { SIDE_COT, STAND, STAND_TOP, STRIP_W, komaDepth, komaWidth, pieceScale } from './dimensions'
import { layout, standCenter } from './layout'
import { pieceMesh } from './piece'

export interface HandSpot {
  type: PieceType
  x: number
  z: number
  rot: number
  count?: number
  lift?: number
  roll?: number
}
export type HandMode = 'strip' | 'fan' | 'rows' | 'grouped'

interface Placed {
  type: PieceType
  x: number
  z: number
  rot: number
  lift: number
  roll?: number
  count?: number
}
interface Bounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}
interface Attempt {
  placed: Placed[]
  b: Bounds
  fits: boolean
}

const BIG = HAND_ORDER.filter((t) => t !== PieceType.PAWN)
const CAPTURE_ORDER = [PieceType.ROOK, PieceType.BISHOP, PieceType.GOLD, PieceType.SILVER, PieceType.KNIGHT, PieceType.LANCE, PieceType.PAWN]
const TIERS = [[PieceType.ROOK, PieceType.BISHOP, PieceType.LANCE], [PieceType.GOLD, PieceType.SILVER, PieceType.KNIGHT], [PieceType.PAWN]]
const INNER = STAND - 0.16
const SIDE_ANGLE = Math.atan(SIDE_COT)
const BEVEL_OUT = (0.025 * 0.96 + 0.004) / Math.sin(SIDE_ANGLE)

const w = (t: PieceType) => komaWidth(pieceScale(t)) * 0.96
const h = (t: PieceType) => pieceScale(t) * 0.96
const big = (t: PieceType) => t === PieceType.ROOK || t === PieceType.BISHOP

const corners = (p: Placed) =>
  [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ].map(([a, b]) => {
    const lx = (a * w(p.type)) / 2
    const lz = (b * h(p.type)) / 2
    return [p.x + lx * Math.cos(p.rot) + lz * Math.sin(p.rot), p.z - lx * Math.sin(p.rot) + lz * Math.cos(p.rot)]
  })

function collide(p: Placed, q: Placed, gap: number) {
  const grow = (c: number[][], o: Placed) => c.map(([x, z]) => [o.x + (x - o.x) * (1 + gap), o.z + (z - o.z) * (1 + gap)])
  const a = grow(corners(p), p)
  const b = grow(corners(q), q)
  for (const r of [p.rot, q.rot]) {
    for (const [ax, az] of [
      [Math.cos(r), -Math.sin(r)],
      [Math.sin(r), Math.cos(r)],
    ]) {
      const pa = a.map(([x, z]) => x * ax + z * az)
      const pb = b.map(([x, z]) => x * ax + z * az)
      if (Math.max(...pa) < Math.min(...pb) || Math.max(...pb) < Math.min(...pa)) return false
    }
  }
  return true
}

function bounds(placed: Placed[]): Bounds {
  const all = placed.flatMap(corners)
  const xs = all.map((c) => c[0])
  const zs = all.map((c) => c[1])
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minZ: Math.min(...zs), maxZ: Math.max(...zs) }
}

const settle = (placed: Placed[], all = true): Attempt => {
  const b = bounds(placed)
  return { placed, b, fits: all && b.maxX - b.minX <= INNER && b.maxZ - b.minZ <= INNER }
}

function ring(row: PieceType[], r: number, gap: number, liftBase: number): Placed[] {
  const pitch = (a: PieceType, b: PieceType) => (w(a) + w(b)) / 2 + gap
  const steps = row.slice(1).map((t, i) => pitch(row[i], t) / (r + Math.max(h(row[i]), h(t)) / 2))
  let phi = -steps.reduce((a, b) => a + b, 0) / 2
  return row.map((type, i) => {
    if (i > 0) phi += steps[i - 1]
    return { type, x: r * Math.sin(phi), z: r * Math.cos(phi), rot: phi, lift: liftBase + i * 0.012 }
  })
}

const moved = (p: Placed, x: number, z: number): Placed => ({ ...p, x, z })

function rows(pieces: PieceType[], gap: number) {
  const placed: Placed[] = []
  let rest = [...pieces]
  let r = 1e4
  let ringIndex = 0
  while (rest.length) {
    const row: PieceType[] = []
    const rowH = Math.max(...rest.slice(0, 1).map(h))
    for (const t of rest) {
      const b = bounds(ring([...row, t], r + rowH / 2, gap, ringIndex * 0.03))
      if (row.length && (b.maxX - b.minX > INNER || big(row[0]) !== big(t))) break
      row.push(t)
    }
    const ringH = Math.max(...row.map(h))
    placed.push(...ring(row, r + ringH / 2, gap, ringIndex * 0.03))
    rest = rest.slice(row.length)
    r += ringH + gap
    ringIndex++
    if (ringIndex > 6) break
  }
  return settle(placed, !rest.length)
}

function fanRow(row: PieceType[], liftBase: number): Placed[] {
  const base = Math.max(...row.map((t) => w(t) / 2 / SIDE_COT)) + BEVEL_OUT
  const half = (t: PieceType) => Math.atan((w(t) / 2 + BEVEL_OUT * Math.sin(SIDE_ANGLE)) / base)
  const steps = row.slice(1).map((t, i) => half(row[i]) + half(t) + 0.002)
  let phi = -steps.reduce((a, b) => a + b, 0) / 2
  return row.map((type, i) => {
    if (i > 0) phi += steps[i - 1]
    const r = base - h(type) / 2
    return { type, x: r * Math.sin(phi), z: r * Math.cos(phi), rot: phi, lift: liftBase }
  })
}

function fan(pieces: PieceType[], split: boolean) {
  const fans: Placed[][] = []
  let rest = [...pieces]
  while (rest.length) {
    const row: PieceType[] = []
    for (const t of rest) {
      const b = bounds(fanRow([...row, t], 0))
      if (row.length && (b.maxX - b.minX > INNER || (split && big(row[0]) !== big(t)))) break
      row.push(t)
    }
    fans.push(fanRow(row, fans.length * 0.03))
    rest = rest.slice(row.length)
  }
  const placed: Placed[] = []
  for (const row of fans) {
    const b = bounds(row)
    const ox = -(b.minX + b.maxX) / 2
    const shifted = (dz: number) => row.map((p) => moved(p, p.x + ox, p.z - b.minZ + dz))
    if (!placed.length) {
      placed.push(...shifted(0))
      continue
    }
    const top = bounds(placed)
    let dz = top.minZ
    while (dz < top.maxZ + 0.05 && shifted(dz).some((p) => placed.some((q) => collide(p, q, 0.04)))) dz += 0.02
    placed.push(...shifted(dz))
  }
  return settle(placed)
}

function stack(type: PieceType, n: number, e: number): Placed[] {
  const thick = (komaDepth(pieceScale(type)) + 0.05) * 0.96
  const roll = Math.asin(Math.min(0.9, thick / w(type)))
  return Array.from({ length: n }, (_, j) => ({
    type,
    x: j * e,
    z: 0,
    rot: 0,
    lift: j ? (w(type) / 2) * Math.sin(roll) + 0.004 : 0,
    roll: j ? -roll : 0,
    count: j === n - 1 && n > 1 ? n : undefined,
  }))
}

function grouped(count: (type: PieceType) => number, expose: number) {
  interface Group {
    type: PieceType
    n: number
  }
  const sizes = (type: PieceType) => {
    const n = count(type)
    return Array.from({ length: Math.ceil(n / 9) }, (_, k) => ({ type, n: Math.min(9, n - k * 9) }))
  }
  const span = (line: Group[], e: number) => line.reduce((sum, g) => sum + w(g.type) + (g.n - 1) * e, 0) + 0.08 * (line.length - 1)
  const lines: Group[][] = []
  for (const tier of TIERS.map((names) => names.flatMap(sizes)).filter((groups) => groups.length)) {
    let line: Group[] = []
    for (const g of tier) {
      if (line.length && span([...line, g], expose) > INNER - 0.04) {
        lines.push(line)
        line = []
      }
      line.push(g)
    }
    if (line.length) lines.push(line)
  }
  const placedRows = lines.map((line) => {
    const overlaps = line.reduce((sum, g) => sum + g.n - 1, 0)
    const room = INNER - 0.04 - span(line, 0)
    const e = overlaps ? Math.max(expose, Math.min(0.5 * Math.min(...line.map((g) => w(g.type))), room / overlaps)) : 0
    let u = 0
    const row: Placed[] = []
    for (const g of line) {
      row.push(...stack(g.type, g.n, e).map((p) => moved(p, p.x + u + w(g.type) / 2, p.z)))
      u += w(g.type) + (g.n - 1) * e + 0.08
    }
    const b = bounds(row)
    return row.map((p) => moved(p, p.x - (b.minX + b.maxX) / 2, p.z - b.minZ))
  })
  const heights = placedRows.map((row) => {
    const b = bounds(row)
    return b.maxZ - b.minZ
  })
  const total = heights.reduce((a, b) => a + b, 0)
  const vgap = placedRows.length > 1 ? Math.max(0.04, Math.min(0.25, (INNER - 0.04 - total) / (placedRows.length - 1))) : 0
  const placed: Placed[] = []
  let v = 0
  placedRows.forEach((row, k) => {
    placed.push(...row.map((p) => moved(p, p.x, p.z + v)))
    v += heights[k] + vgap
  })
  return settle(placed)
}

export function handArrangement(position: ImmutablePosition, color: Color): { spots: HandSpot[]; mode: HandMode } {
  const hand = position.hand(color)
  const c = standCenter(color)
  const sign = color === Color.BLACK ? 1 : -1
  if (layout.portrait) {
    const types = [...BIG, PieceType.PAWN].filter((t) => hand.count(t) > 0)
    return { mode: 'strip', spots: types.map((type, i) => ({ type, x: c.x + sign * (STRIP_W / 2 - 0.6 - i * 1.02), z: c.z, rot: 0, count: hand.count(type) })) }
  }
  const pieces = CAPTURE_ORDER.flatMap((t) => Array(hand.count(t)).fill(t) as PieceType[])
  const split = fan(pieces, true)
  const fanned = split.fits ? split : fan(pieces, false)
  const flat = fanned.fits ? undefined : [0.04, 0.02, 0].map((gap) => rows(pieces, gap)).find((a) => a.fits)
  let mode: HandMode = 'fan'
  let best = fanned
  if (!fanned.fits) {
    if (flat) {
      mode = 'rows'
      best = flat
    } else {
      mode = 'grouped'
      best = [0.17, 0.14, 0.11, 0.09, 0.07].map((e) => grouped((t) => hand.count(t), e)).find((a) => a.fits) ?? grouped((t) => hand.count(t), 0.07)
    }
  }
  const ox = -(best.b.minX + best.b.maxX) / 2
  const oz = -(best.b.minZ + best.b.maxZ) / 2
  return {
    mode,
    spots: best.placed.map((p) => ({
      type: p.type,
      x: c.x + sign * (p.x + ox),
      z: c.z + sign * (p.z + oz),
      rot: p.rot,
      lift: p.lift,
      roll: p.roll,
      count: p.count,
    })),
  }
}

export const handLayout = (position: ImmutablePosition, color: Color) => handArrangement(position, color).spots

export function handSpot(position: ImmutablePosition, color: Color, type: PieceType) {
  const spots = handLayout(position, color).filter((p) => p.type === type)
  const spot = spots[Math.floor(spots.length / 2)]
  return spot ? new THREE.Vector3(spot.x, STAND_TOP, spot.z) : null
}

export function handPieceMesh(spot: HandSpot, color: Color, seed = 1, envMap?: THREE.Texture) {
  const mesh = pieceMesh(spot.type, color, seed, 64, undefined, envMap)
  mesh.rotation.y += spot.rot
  mesh.rotation.z = spot.roll ?? 0
  mesh.scale.setScalar(0.96)
  mesh.position.set(spot.x, STAND_TOP + (spot.lift ?? 0), spot.z)
  return mesh
}
