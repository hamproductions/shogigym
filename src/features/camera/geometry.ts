export type Point = { x: number; y: number }
export type Mat3 = number[]
type Vec3 = [number, number, number]

export const SQUARE_ASPECT = 1.09
export const PIECE_HEIGHT = 0.06

function solve(a: number[][], b: number[]): number[] | null {
  const n = b.length
  const m = a.map((row, i) => [...row, b[i]])
  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let row = col + 1; row < n; row++) if (Math.abs(m[row][col]) > Math.abs(m[pivot][col])) pivot = row
    if (Math.abs(m[pivot][col]) < 1e-12) return null
    ;[m[col], m[pivot]] = [m[pivot], m[col]]
    for (let row = 0; row < n; row++) {
      if (row === col) continue
      const f = m[row][col] / m[col][col]
      for (let k = col; k <= n; k++) m[row][k] -= f * m[col][k]
    }
  }
  return m.map((row, i) => row[n] / row[i])
}

export function homography(src: Point[], dst: Point[]): Mat3 | null {
  const a: number[][] = []
  const b: number[] = []
  src.forEach(({ x, y }, i) => {
    const { x: u, y: v } = dst[i]
    a.push([x, y, 1, 0, 0, 0, -u * x, -u * y])
    b.push(u)
    a.push([0, 0, 0, x, y, 1, -v * x, -v * y])
    b.push(v)
  })
  const h = solve(a, b)
  return h && [...h, 1]
}

export function apply(h: Mat3, { x, y }: Point): Point {
  const w = h[6] * x + h[7] * y + h[8]
  return { x: (h[0] * x + h[1] * y + h[2]) / w, y: (h[3] * x + h[4] * y + h[5]) / w }
}

const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s]
const norm = (a: Vec3) => Math.hypot(a[0], a[1], a[2])

export type Pose = { project: (x: number, y: number, z: number) => Point; focal: number; elevation: number }

export function pose(h: Mat3, width: number, height: number): Pose {
  const cx = width / 2
  const cy = height / 2
  const c = (i: number): Vec3 => [h[i] - cx * h[6 + i], h[3 + i] - cy * h[6 + i], h[6 + i]]
  const [a, b, t0] = [c(0), c(1), c(2)]
  const estimates = [-(a[0] * b[0] + a[1] * b[1]) / (a[2] * b[2]), (a[0] ** 2 + a[1] ** 2 - b[0] ** 2 - b[1] ** 2) / (b[2] ** 2 - a[2] ** 2)].filter(
    (f2) => Number.isFinite(f2) && f2 > 0,
  )
  const span = Math.max(width, height)
  const guess = estimates.length ? Math.sqrt(estimates.reduce((s, f2) => s + f2, 0) / estimates.length) : NaN
  const focal = Number.isFinite(guess) && guess > span * 0.4 && guess < span * 4 ? guess : span * 0.85
  const m = (v: Vec3): Vec3 => [v[0] / focal, v[1] / focal, v[2]]
  const [m1, m2, m3] = [m(a), m(b), m(t0)]
  const lambda = (2 / (norm(m1) + norm(m2))) * (m3[2] < 0 ? -1 : 1)
  const r1 = scale(m1, lambda)
  const r2 = scale(m2, lambda)
  const t = scale(m3, lambda)
  let r3 = cross(r1, r2)
  if (dot(r3, t) > 0) r3 = scale(r3, -1)
  const distance = norm(t)
  const elevation = Math.asin(Math.min(1, Math.abs(dot(r3, t)) / (distance || 1)))
  const project = (x: number, y: number, z: number): Point => {
    const p: Vec3 = [r1[0] * x + r2[0] * y + r3[0] * z + t[0], r1[1] * x + r2[1] * y + r3[1] * z + t[1], r1[2] * x + r2[2] * y + r3[2] * z + t[2]]
    return { x: (focal * p[0]) / p[2] + cx, y: (focal * p[1]) / p[2] + cy }
  }
  return { project, focal, elevation }
}

export function orderCorners(points: Point[]): Point[] {
  const cx = points.reduce((s, p) => s + p.x, 0) / points.length
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length
  const sorted = [...points].sort((p, q) => Math.atan2(p.y - cy, p.x - cx) - Math.atan2(q.y - cy, q.x - cx))
  const start = sorted.reduce((best, p, i) => (p.x + p.y < sorted[best].x + sorted[best].y ? i : best), 0)
  return [...sorted.slice(start), ...sorted.slice(0, start)]
}
