import { Color, PieceType, Square, type ImmutablePosition } from 'tsshogi'
import { HAND_ORDER, legalTargets, promotionOptions } from '@/utils/shogi'
import { apply, homography, PIECE_HEIGHT, pose, SQUARE_ASPECT, type Point } from './geometry'

export const PATCH = 24
export const CELLS = 81
const AREA = PATCH * PATCH
const INSET = 0.04
export const MOTION = 0.16

export type Rotation = 0 | 1 | 2 | 3
export type Calibration = { corners: Point[]; rotation: Rotation; lift?: number; oriented?: boolean }

const toGrid = (x: number, y: number, rotation: Rotation): [number, number] =>
  rotation === 0 ? [x, y] : rotation === 1 ? [9 - y, x] : rotation === 2 ? [9 - x, 9 - y] : [y, 9 - x]

export type Sampler = { coords: Float32Array; width: number; height: number; elevation: number }

export function buildSampler({ corners, rotation, lift = PIECE_HEIGHT }: Calibration, width: number, height: number): Sampler | null {
  if (corners.length !== 4) return null
  const odd = rotation % 2 === 1
  const sx = odd ? SQUARE_ASPECT : 1
  const sy = odd ? 1 : SQUARE_ASPECT
  const metric = [
    { x: 0, y: 0 },
    { x: 9 * sx, y: 0 },
    { x: 9 * sx, y: 9 * sy },
    { x: 0, y: 9 * sy },
  ]
  const h = homography(
    metric,
    corners.map((p) => ({ x: p.x * width, y: p.y * height })),
  )
  if (!h) return null
  const camera = pose(h, width, height)
  const coords = new Float32Array(CELLS * AREA * 2)
  let k = 0
  for (let cell = 0; cell < CELLS; cell++) {
    for (let j = 0; j < PATCH; j++) {
      for (let i = 0; i < PATCH; i++) {
        const u = INSET + ((1 - 2 * INSET) * (i + 0.5)) / PATCH
        const v = INSET + ((1 - 2 * INSET) * (j + 0.5)) / PATCH
        const [gx, gy] = toGrid((cell % 9) + u, Math.floor(cell / 9) + v, rotation)
        const p = camera.project(gx * sx, gy * sy, lift)
        coords[k++] = p.x
        coords[k++] = p.y
      }
    }
  }
  return { coords, width, height, elevation: camera.elevation }
}

export const CROP = 64
const MARGIN = 0.12

export function cropCells({ corners, rotation, lift = PIECE_HEIGHT }: Calibration, width: number, height: number, data: Uint8ClampedArray) {
  const odd = rotation % 2 === 1
  const sx = odd ? SQUARE_ASPECT : 1
  const sy = odd ? 1 : SQUARE_ASPECT
  const h = homography(
    [
      { x: 0, y: 0 },
      { x: 9 * sx, y: 0 },
      { x: 9 * sx, y: 9 * sy },
      { x: 0, y: 9 * sy },
    ],
    corners.map((p) => ({ x: p.x * width, y: p.y * height })),
  )
  const out = new Uint8Array(CELLS * CROP * CROP * 3)
  if (!h) return out
  const camera = pose(h, width, height)
  let k = 0
  for (let cell = 0; cell < CELLS; cell++)
    for (let j = 0; j < CROP; j++)
      for (let i = 0; i < CROP; i++) {
        const u = -MARGIN + ((1 + 2 * MARGIN) * (i + 0.5)) / CROP
        const v = -MARGIN + ((1 + 2 * MARGIN) * (j + 0.5)) / CROP
        const [gx, gy] = toGrid((cell % 9) + u, Math.floor(cell / 9) + v, rotation)
        const p = camera.project(gx * sx, gy * sy, lift)
        const x = Math.min(width - 1, Math.max(0, Math.round(p.x)))
        const y = Math.min(height - 1, Math.max(0, Math.round(p.y)))
        const n = (y * width + x) * 4
        out[k++] = data[n]
        out[k++] = data[n + 1]
        out[k++] = data[n + 2]
      }
  return out
}

export function sample({ coords, width, height }: Sampler, data: Uint8ClampedArray, out: Float32Array, red: Float32Array) {
  red.fill(0)
  let sum = 0
  let squares = 0
  const n = out.length
  for (let k = 0; k < n; k++) {
    const x = Math.min(width - 1.001, Math.max(0, coords[2 * k]))
    const y = Math.min(height - 1.001, Math.max(0, coords[2 * k + 1]))
    const x0 = x | 0
    const y0 = y | 0
    const fx = x - x0
    const fy = y - y0
    const at = (xx: number, yy: number) => {
      const i = (yy * width + xx) * 4
      return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    }
    const g = (at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx) * (1 - fy) + (at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx) * fy
    const near = (Math.round(y) * width + Math.round(x)) * 4
    const [r, gr, bl] = [data[near], data[near + 1], data[near + 2]]
    if (r > 1.6 * gr && r > 1.6 * bl && r - gr > 50) red[(k / AREA) | 0] += 1 / AREA
    out[k] = g
    sum += g
    squares += g * g
  }
  const mean = sum / n
  const std = Math.sqrt(Math.max(1e-6, squares / n - mean * mean))
  for (let k = 0; k < n; k++) out[k] = (out[k] - mean) / std
}

export const frameBuffer = () => new Float32Array(CELLS * AREA)
export const redBuffer = () => new Float32Array(CELLS)

const BLOCK = 4
const BLOCKS = (PATCH / BLOCK) ** 2

export function cellDiffs(a: Float32Array, b: Float32Array, out = new Float32Array(CELLS)) {
  for (let cell = 0; cell < CELLS; cell++) {
    let total = 0
    for (let by = 0; by < PATCH; by += BLOCK)
      for (let bx = 0; bx < PATCH; bx += BLOCK) {
        let delta = 0
        for (let j = by; j < by + BLOCK; j++)
          for (let i = bx; i < bx + BLOCK; i++) {
            const k = cell * AREA + j * PATCH + i
            delta += a[k] - b[k]
          }
        total += Math.abs(delta) / (BLOCK * BLOCK)
      }
    out[cell] = total / BLOCKS
  }
  return out
}

const EDGE = 3

export function texture(frame: Float32Array, cell: number) {
  let total = 0
  let count = 0
  const base = cell * AREA
  for (let j = EDGE; j < PATCH - EDGE; j++)
    for (let i = EDGE; i < PATCH - EDGE; i++) {
      const k = base + j * PATCH + i
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) total += Math.abs(frame[k] - frame[k + dy * PATCH + dx])
      count += 8
    }
  return total / count
}

const OCCUPIED = 0.26

const RED_PIECE = 0.02
const CLEARLY_EMPTY = 0.24
const CLEARLY_OCCUPIED = 0.32

export function occupancy(frame: Float32Array, out = new Uint8Array(CELLS), prior?: Uint8Array | null, red?: Float32Array) {
  const values = Array.from({ length: CELLS }, (_, cell) => texture(frame, cell))
  const low = Math.min(...values)
  const high = Math.max(...values)
  for (let cell = 0; cell < CELLS; cell++) {
    const v = (values[cell] - low) / (high - low + 1e-9)
    out[cell] = red && red[cell] >= RED_PIECE ? 1 : prior && v > CLEARLY_EMPTY && v < CLEARLY_OCCUPIED ? prior[cell] : v > OCCUPIED ? 1 : 0
  }
  return out
}

export function occupancyOf(position: ImmutablePosition) {
  const out = new Uint8Array(CELLS)
  for (const square of position.board.listNonEmptySquares()) out[square.index] = 1
  return out
}

export const sameOccupancy = (a: Uint8Array, b: Uint8Array) => a.every((v, i) => v === b[i])
export const occupancyChanges = (a: Uint8Array, b: Uint8Array) => [...a.keys()].filter((i) => a[i] !== b[i])

export function occupancyScore(frame: Float32Array, position: ImmutablePosition) {
  const on: number[] = []
  const off: number[] = []
  for (const square of Square.all) (position.board.at(square) ? on : off).push(texture(frame, square.index))
  if (!on.length || !off.length) return 0
  const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length
  const variance = (xs: number[], m: number) => xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length
  const [mOn, mOff] = [mean(on), mean(off)]
  return (mOn - mOff) / Math.sqrt((variance(on, mOn) + variance(off, mOff)) / 2 + 1e-6)
}

export function binarize(frame: Float32Array, cell: number, flip = false) {
  const out = new Uint8Array(AREA)
  const base = cell * AREA
  const at = (i: number, j: number) => frame[base + Math.min(PATCH - 1, Math.max(0, j)) * PATCH + Math.min(PATCH - 1, Math.max(0, i))]
  for (let j = 0; j < PATCH; j++)
    for (let i = 0; i < PATCH; i++) {
      let local = 0
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) local += at(i + dx, j + dy)
      const k = j * PATCH + i
      out[flip ? AREA - 1 - k : k] = at(i, j) < local / 25 - 0.05 ? 1 : 0
    }
  return out
}

const SHIFT = 4

export function match(a: Uint8Array, b: Uint8Array) {
  let best = 0
  for (let sy = -SHIFT; sy <= SHIFT; sy++)
    for (let sx = -SHIFT; sx <= SHIFT; sx++) {
      let same = 0
      let ink = 0
      for (let j = SHIFT; j < PATCH - SHIFT; j++)
        for (let i = SHIFT; i < PATCH - SHIFT; i++) {
          const p = a[j * PATCH + i]
          const q = b[(j + sy) * PATCH + i + sx]
          if (p || q) {
            ink++
            if (p && q) same++
          }
        }
      if (ink) best = Math.max(best, same / ink)
    }
  return best
}

const BOOK_SIZE = 8

export class PieceBook {
  private store = new Map<PieceType, Uint8Array[]>()

  update(position: ImmutablePosition, frame: Float32Array) {
    for (const square of position.board.listNonEmptySquares()) {
      const piece = position.board.at(square)!
      const entries = this.store.get(piece.type) ?? []
      entries.push(binarize(frame, square.index, piece.color === Color.WHITE))
      if (entries.length > BOOK_SIZE) entries.shift()
      this.store.set(piece.type, entries)
    }
  }

  has(type: PieceType) {
    return !!this.store.get(type)?.length
  }

  score(frame: Float32Array, cell: number, type: PieceType, color: Color) {
    const glyph = binarize(frame, cell, color === Color.WHITE)
    const scores = (this.store.get(type) ?? []).map((entry) => match(glyph, entry)).sort((a, b) => b - a)
    return scores.length ? scores.slice(0, 3).reduce((s, v) => s + v, 0) / Math.min(3, scores.length) : -1
  }
}

export const rotateFrame = (frame: Float32Array) => frame.slice().reverse()
export const rotateDiffs = (diffs: Float32Array) => diffs.slice().reverse()

const UNIT = [
  { x: 0, y: 0 },
  { x: 9, y: 0 },
  { x: 9, y: 9 },
  { x: 0, y: 9 },
]

export function cellPolygon({ corners, rotation }: Calibration, cell: number): Point[] {
  const plane = homography(UNIT, corners)
  if (!plane) return []
  return [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ].map(([u, v]) => {
    const [gx, gy] = toGrid((cell % 9) + u, Math.floor(cell / 9) + v, rotation)
    return apply(plane, { x: gx, y: gy })
  })
}

export function gridLines(corners: Point[]): [Point, Point][] {
  const plane = homography(UNIT, corners)
  if (!plane) return []
  const lines: [Point, Point][] = []
  for (let i = 0; i <= 9; i++) {
    lines.push([apply(plane, { x: i, y: 0 }), apply(plane, { x: i, y: 9 })])
    lines.push([apply(plane, { x: 0, y: i }), apply(plane, { x: 9, y: i })])
  }
  return lines
}

export function edgeMidpoint(corners: Point[], rotation: Rotation, side: 'sente' | 'gote'): Point {
  const plane = homography(UNIT, corners)!
  const [gx, gy] = toGrid(4.5, side === 'sente' ? 9 : 0, rotation)
  return apply(plane, { x: gx, y: gy })
}

const RED_INK = 0.01

export type Frame = { patches: Float32Array; red: Float32Array }

export type Resolution = { usi: string } | { promote: { from: Square; to: Square } } | { drop: { to: Square; types: PieceType[] } }

const PROMOTED: Partial<Record<PieceType, PieceType>> = {
  [PieceType.PAWN]: PieceType.PROM_PAWN,
  [PieceType.LANCE]: PieceType.PROM_LANCE,
  [PieceType.KNIGHT]: PieceType.PROM_KNIGHT,
  [PieceType.SILVER]: PieceType.PROM_SILVER,
  [PieceType.BISHOP]: PieceType.HORSE,
  [PieceType.ROOK]: PieceType.DRAGON,
}

export type Readings = Map<number, { empty: number; type: Map<PieceType, number>; up: number }> | null

function promotion(
  position: ImmutablePosition,
  from: Square,
  to: Square,
  before: Frame,
  after: Frame,
  book: PieceBook,
  readings: Readings = null,
): Resolution | null {
  const options = promotionOptions(position, from, to)
  if (options.length === 0) return null
  if (options.length === 1) return { usi: options[0].usi }
  const promote = options.find((m) => m.promote)!.usi
  const stay = options.find((m) => !m.promote)!.usi
  if (before.red[from.index] < RED_INK && after.red[to.index] >= RED_INK) return { usi: promote }
  const piece = position.board.at(from)!
  const reading = readings?.get(to.index)
  const raisedType = PROMOTED[piece.type]
  if (reading && raisedType) {
    const plainP = reading.type.get(piece.type) ?? 0
    const raisedP = reading.type.get(raisedType) ?? 0
    if (Math.max(plainP, raisedP) > 0.3 && Math.abs(plainP - raisedP) > 0.2) return { usi: raisedP > plainP ? promote : stay }
  }
  const plain = book.score(after.patches, to.index, piece.type, piece.color)
  const promoted = PROMOTED[piece.type]
  if (promoted && book.has(promoted)) {
    const raised = book.score(after.patches, to.index, promoted, piece.color)
    if (Math.abs(raised - plain) >= 0.08) return { usi: raised > plain ? promote : stay }
  }
  const self = match(binarize(before.patches, from.index), binarize(after.patches, to.index))
  if (self >= 0.6) return { usi: stay }
  if (self < 0.35) return { usi: promote }
  return { promote: { from, to } }
}

function capturedSquare(position: ImmutablePosition, from: Square, before: Frame, after: Frame) {
  const color = position.color
  let best: { square: Square; score: number } | null = null
  for (const to of legalTargets(position, from)) {
    const target = position.board.at(to)
    if (!target || target.color === color) continue
    const score = match(binarize(before.patches, to.index), binarize(after.patches, to.index))
    if (!best || score < best.score) best = { square: to, score }
  }
  return best?.square ?? null
}

export function inferMove(
  position: ImmutablePosition,
  changes: number[],
  before: Frame,
  after: Frame,
  book: PieceBook,
  readings: Readings = null,
): Resolution | null {
  const color = position.color
  if (changes.length === 1) {
    const square = Square.newByIndex(changes[0])
    const piece = position.board.at(square)
    if (!piece) {
      const types = HAND_ORDER.filter((t) => {
        const move = position.hand(color).count(t) > 0 ? position.createMove(t, square) : null
        return !!move && position.isValidMove(move)
      })
      if (types.length === 0) return null
      if (types.length === 1) return { usi: position.createMove(types[0], square)!.usi }
      const reading = readings?.get(square.index)
      const scored = types
        .map((type) => ({ type, score: reading ? (reading.type.get(type) ?? 0) : book.score(after.patches, square.index, type, color) }))
        .sort((a, b) => b.score - a.score)
      if (scored[0].score > -1) return { usi: position.createMove(scored[0].type, square)!.usi }
      return { drop: { to: square, types: scored.map((s) => s.type) } }
    }
    if (piece.color !== color) return null
    const to = capturedSquare(position, square, before, after)
    return to ? promotion(position, square, to, before, after, book, readings) : null
  }
  if (changes.length === 2) {
    const [a, b] = changes.map((c) => Square.newByIndex(c))
    const [from, to] = position.board.at(a) ? [a, b] : [b, a]
    const piece = position.board.at(from)
    if (!piece || piece.color !== color || position.board.at(to)) return null
    return promotion(position, from, to, before, after, book, readings)
  }
  return null
}

export const moveShape = (position: ImmutablePosition, changes: number[]) => {
  const color = position.color
  if (changes.length === 1) {
    const piece = position.board.at(Square.newByIndex(changes[0]))
    if (!piece) return HAND_ORDER.some((t) => position.hand(color).count(t) > 0)
    return piece.color === color
  }
  if (changes.length !== 2) return false
  const pieces = changes.map((c) => position.board.at(Square.newByIndex(c)))
  const mover = pieces.find((p) => p)
  return pieces.filter((p) => p).length === 1 && mover!.color === color
}

export const SHIFTED = 6

const LIFTS = [0, 0.04, 0.08, 0.12, 0.16, 0.2, 0.24]

export function fitCalibration(data: Uint8ClampedArray, width: number, height: number, start: Calibration, position: ImmutablePosition, rotations: Rotation[]) {
  const frame = frameBuffer()
  const red = redBuffer()
  const score = (calibration: Calibration) => {
    const sampler = buildSampler(calibration, width, height)
    if (!sampler) return -Infinity
    sample(sampler, data, frame, red)
    return occupancyScore(frame, position)
  }
  const ranked = rotations.flatMap((rotation) =>
    LIFTS.map((lift) => ({ calibration: { ...start, rotation, lift }, score: score({ ...start, rotation, lift }) })),
  )
  ranked.sort((a, b) => b.score - a.score)
  const { calibration: best, score: bestScore } = ranked[0]
  return { calibration: best, score: bestScore, twin: score({ ...best, rotation: ((best.rotation + 2) % 4) as Rotation }) }
}

const luma = (data: Uint8ClampedArray, width: number, height: number, x: number, y: number) => {
  const i = (Math.min(height - 1, Math.max(0, Math.round(y))) * width + Math.min(width - 1, Math.max(0, Math.round(x)))) * 4
  return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
}

export function lineContrasts(data: Uint8ClampedArray, width: number, height: number, corners: Point[]) {
  const plane = homography(
    UNIT,
    corners.map((p) => ({ x: p.x * width, y: p.y * height })),
  )
  if (!plane) return []
  const out: number[] = []
  for (const vertical of [true, false])
    for (let k = 0; k <= 9; k++) {
      let sum = 0
      let n = 0
      for (let t = 0.25; t < 9; t += 0.25) {
        const at = (a: number, b: number) => {
          const p = apply(plane, vertical ? { x: a, y: b } : { x: b, y: a })
          return luma(data, width, height, p.x, p.y)
        }
        sum += Math.min(at(k - 0.12, t), at(k + 0.12, t)) - at(k, t)
        n++
      }
      out.push(sum / n)
    }
  return out
}

export function gridScore(data: Uint8ClampedArray, width: number, height: number, corners: Point[], coarse = false) {
  const plane = homography(
    UNIT,
    corners.map((p) => ({ x: p.x * width, y: p.y * height })),
  )
  if (!plane) return -Infinity
  let line = 0
  let off = 0
  let n = 0
  for (let k = 0; k <= 9; k++)
    for (let t = 0.25; t < 9; t += coarse ? 0.75 : 0.25)
      for (const vertical of [true, false]) {
        const at = (a: number, b: number) => {
          const p = apply(plane, vertical ? { x: a, y: b } : { x: b, y: a })
          return luma(data, width, height, p.x, p.y)
        }
        const lo = k - 0.12
        const hi = k + 0.12
        line += at(k, t)
        off += Math.min(at(lo, t), at(hi, t))
        n++
      }
  return (off - line) / n
}

export function refineCorners(data: Uint8ClampedArray, width: number, height: number, corners: Point[], reach = 0.5) {
  const span = Math.hypot(corners[2].x - corners[0].x, corners[2].y - corners[0].y) / (9 * Math.SQRT2)
  let best = corners
  let score = gridScore(data, width, height, best)
  for (const step of [reach, reach / 2, reach / 4, reach / 8, reach / 16].map((s) => s * span))
    for (let pass = 0; pass < 3; pass++) {
      let improved = false
      for (let i = 0; i < 4; i++)
        for (const [dx, dy] of [
          [step, 0],
          [-step, 0],
          [0, step],
          [0, -step],
        ]) {
          const next = best.map((c, j) => (j === i ? { x: c.x + dx, y: c.y + (dy * width) / height } : c))
          const value = gridScore(data, width, height, next)
          if (value > score) {
            ;[best, score] = [next, value]
            improved = true
          }
        }
      if (!improved) break
    }
  return { corners: best, score }
}

export function detectBoard(data: Uint8ClampedArray, width: number, height: number): Point[] | null {
  const step = Math.max(1, Math.round(width / 160))
  const cols = Math.floor(width / step)
  const rows = Math.floor(height / step)
  const wood = new Uint8Array(cols * rows)
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const i = (r * step * width + c * step) * 4
      const [red, green, blue] = [data[i], data[i + 1], data[i + 2]]
      const max = Math.max(red, green, blue)
      const min = Math.min(red, green, blue)
      const sat = max ? (max - min) / max : 0
      wood[r * cols + c] = red === max && red > 100 && sat > 0.1 && sat < 0.75 && green > blue && green - blue > 8 ? 1 : 0
    }
  const label = new Int32Array(cols * rows).fill(-1)
  let bestSize = 0
  let bestLabel = -1
  for (let start = 0; start < wood.length; start++) {
    if (!wood[start] || label[start] >= 0) continue
    const stack = [start]
    label[start] = start
    let size = 0
    while (stack.length) {
      const k = stack.pop()!
      size++
      const r = Math.floor(k / cols)
      const c = k % cols
      for (const [dr, dc] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const rr = r + dr
        const cc = c + dc
        if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) continue
        const n = rr * cols + cc
        if (wood[n] && label[n] < 0) {
          label[n] = start
          stack.push(n)
        }
      }
    }
    if (size > bestSize) [bestSize, bestLabel] = [size, start]
  }
  if (bestSize < cols * rows * 0.05) return null
  const extreme = (score: (x: number, y: number) => number) => {
    let best = { x: 0, y: 0, v: -Infinity }
    for (let k = 0; k < label.length; k++)
      if (label[k] === bestLabel) {
        const x = (k % cols) * step
        const y = Math.floor(k / cols) * step
        const v = score(x, y)
        if (v > best.v) best = { x, y, v }
      }
    return { x: best.x / width, y: best.y / height }
  }
  const outline = [extreme((x, y) => -x - y), extreme((x, y) => x - y), extreme((x, y) => x + y), extreme((x, y) => y - x)]
  const center = outline.reduce((s, p) => ({ x: s.x + p.x / 4, y: s.y + p.y / 4 }), { x: 0, y: 0 })
  return outline.map((p) => ({ x: center.x + (p.x - center.x) * 0.93, y: center.y + (p.y - center.y) * 0.93 }))
}

const RECT = 240
const RECT_MARGIN = 2.25

export function lineProfiles(data: Uint8ClampedArray, width: number, height: number, quad: Point[], wide = false) {
  const plane = homography(
    UNIT,
    quad.map((p) => ({ x: p.x * width, y: p.y * height })),
  )!
  const margin = wide ? 4 : RECT_MARGIN
  const span = 9 + 2 * margin
  const unit = (i: number) => -margin + (span * (i + 0.5)) / RECT
  const image = new Float32Array(RECT * RECT)
  for (let j = 0; j < RECT; j++)
    for (let i = 0; i < RECT; i++) {
      const p = apply(plane, { x: unit(i), y: unit(j) })
      image[j * RECT + i] = luma(data, width, height, p.x, p.y)
    }
  const at = (i: number, j: number) => image[Math.min(RECT - 1, Math.max(0, j)) * RECT + Math.min(RECT - 1, Math.max(0, i))]
  const d = 2
  const columns = [new Float32Array(RECT), new Float32Array(RECT)]
  const rows = [new Float32Array(RECT), new Float32Array(RECT)]
  for (let j = 0; j < RECT; j++)
    for (let i = 0; i < RECT; i++) {
      const v = at(i, j)
      const vertical = Math.max(0, Math.min(at(i - d, j), at(i + d, j)) - v)
      const horizontal = Math.max(0, Math.min(at(i, j - d), at(i, j + d)) - v)
      columns[unit(j) < 4.5 ? 0 : 1][i] += vertical
      rows[unit(i) < 4.5 ? 0 : 1][j] += horizontal
    }
  return { columns, rows, margin, toPixel: (u: number) => ((u + margin) / span) * RECT - 0.5 }
}

export function fitLines(profile: Float32Array, toPixel: (u: number) => number, wide = false) {
  const sample = (x: number) => {
    const i = Math.floor(x)
    const f = x - i
    if (i < 0 || i >= RECT - 1) return 0
    return profile[i] * (1 - f) + profile[i + 1] * f
  }
  let best = { start: 0, pitch: 1, score: -Infinity }
  const margin = wide ? 4 : RECT_MARGIN
  for (let pitch = wide ? 0.6 : 0.8; pitch <= (wide ? 1.6 : 1.2); pitch += 0.01)
    for (let start = -margin + 0.2; start + 9 * pitch <= 9 + margin - 0.2; start += 0.02) {
      let score = 0
      for (let k = 0; k <= 9; k++) score += sample(toPixel(start + k * pitch))
      if (score > best.score) best = { start, pitch, score }
    }
  return best
}

export function snapGrid(data: Uint8ClampedArray, width: number, height: number, quad: Point[], wide = false) {
  const { columns, rows, toPixel } = lineProfiles(data, width, height, quad, wide)
  const [top, bottom] = columns.map((p) => fitLines(p, toPixel, wide))
  const [left, right] = rows.map((p) => fitLines(p, toPixel, wide))
  const xAt = (k: number, v: number) => {
    const a = top.start + k * top.pitch
    const b = bottom.start + k * bottom.pitch
    return a + ((b - a) * (v - 2.25)) / 4.5
  }
  const yAt = (k: number, u: number) => {
    const a = left.start + k * left.pitch
    const b = right.start + k * right.pitch
    return a + ((b - a) * (u - 2.25)) / 4.5
  }
  const corner = (kx: number, ky: number) => {
    let u = kx * 9
    let v = ky * 9
    for (let n = 0; n < 4; n++) {
      u = xAt(kx * 9, v)
      v = yAt(ky * 9, u)
    }
    return { x: u, y: v }
  }
  const plane = homography(
    UNIT,
    quad.map((p) => ({ x: p.x * width, y: p.y * height })),
  )!
  return [corner(0, 0), corner(1, 0), corner(1, 1), corner(0, 1)].map((p) => {
    const q = apply(plane, p)
    return { x: q.x / width, y: q.y / height }
  })
}

function globalSearch(data: Uint8ClampedArray, width: number, height: number, start: Point[], shift: number, wide = false) {
  const center = start.reduce((sum, p) => ({ x: sum.x + p.x / 4, y: sum.y + p.y / 4 }), { x: 0, y: 0 })
  let best = { corners: start, score: gridScore(data, width, height, start) }
  const scales = wide ? [0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.35, 1.5, 1.6] : [0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15]
  const steps = wide ? 6 : 10
  const reach = wide ? 0.2 : shift
  for (const sx of scales)
    for (const sy of wide ? scales : [sx])
      for (let i = -steps; i <= steps; i++)
        for (let j = -steps; j <= steps; j++) {
          const dx = (i / steps) * reach
          const dy = ((j / steps) * reach * width) / height
          const corners = start.map((p) => ({ x: center.x + (p.x - center.x) * sx + dx, y: center.y + (p.y - center.y) * sy + dy }))
          const score = gridScore(data, width, height, corners, true)
          if (score > best.score) best = { corners, score }
        }
  return { corners: best.corners, score: gridScore(data, width, height, best.corners) }
}

export function gridLocked(data: Uint8ClampedArray, width: number, height: number, corners: Point[]) {
  const contrasts = lineContrasts(data, width, height, corners)
  const median = [...contrasts].sort((a, b) => a - b)[10] ?? 0
  return median > 8 && contrasts.filter((v) => v < median * 0.35).length <= 2
}

export function autoGrid(data: Uint8ClampedArray, width: number, height: number, previous?: Point[] | null, track = false) {
  const starts = [previous, track ? null : detectBoard(data, width, height)].filter((p): p is Point[] => !!p && p.length === 4)
  let best: { corners: Point[]; score: number } | null = null
  for (const start of starts) {
    let current = globalSearch(data, width, height, start, track ? 0.06 : 0.12)
    for (let n = 0; n < 4; n++) {
      const corners = snapGrid(data, width, height, current.corners)
      const score = gridScore(data, width, height, corners)
      if (score <= current.score) break
      current = { corners, score }
    }
    const fine = refineCorners(data, width, height, current.corners, 0.08)
    if (!best || fine.score > best.score) best = fine
  }
  return best
}

export function snapRefine(data: Uint8ClampedArray, width: number, height: number, corners: Point[]) {
  let current = { corners, score: gridScore(data, width, height, corners) }
  for (let round = 0; round < 3; round++) {
    let next = current
    for (let n = 0; n < 2; n++) {
      const snapped = snapGrid(data, width, height, next.corners)
      const score = gridScore(data, width, height, snapped)
      if (score <= next.score) break
      next = { corners: snapped, score }
    }
    next = refineCorners(data, width, height, next.corners, 0.06)
    if (next.score <= current.score + 0.5) break
    current = next
  }
  return current
}
