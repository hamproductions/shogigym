import { PieceType } from 'tsshogi'
import { CROP } from './vision'

const TYPES = [
  null,
  PieceType.PAWN,
  PieceType.LANCE,
  PieceType.KNIGHT,
  PieceType.SILVER,
  PieceType.GOLD,
  PieceType.BISHOP,
  PieceType.ROOK,
  PieceType.KING,
  PieceType.PROM_PAWN,
  PieceType.PROM_LANCE,
  PieceType.PROM_KNIGHT,
  PieceType.PROM_SILVER,
  PieceType.HORSE,
  PieceType.DRAGON,
] as const

export type CellReading = { empty: number; type: Map<PieceType, number>; up: number }

type Session = { run: (feeds: Record<string, unknown>) => Promise<Record<string, { data: Float32Array }>> }

let session: Promise<{ session: Session; Tensor: new (type: 'float32', data: Float32Array, dims: number[]) => unknown } | null> | null = null

function load() {
  session ??= import('onnxruntime-web')
    .then(async (ort) => {
      ort.env.wasm.wasmPaths = { wasm: `${import.meta.env.BASE_URL}ort/ort-wasm-simd-threaded.wasm` }
      ort.env.wasm.numThreads = 1
      const created = await ort.InferenceSession.create(`${import.meta.env.BASE_URL}models/piece.onnx`, { executionProviders: ['wasm'] })
      return { session: created as unknown as Session, Tensor: ort.Tensor as never }
    })
    .catch((error) => {
      console.warn('piece classifier unavailable', error)
      return null
    })
  return session
}

export const preloadClassifier = () => void load()

const softmax = (values: Float32Array, start: number, length: number) => {
  let max = -Infinity
  for (let i = 0; i < length; i++) max = Math.max(max, values[start + i])
  const out = new Float32Array(length)
  let sum = 0
  for (let i = 0; i < length; i++) sum += out[i] = Math.exp(values[start + i] - max)
  for (let i = 0; i < length; i++) out[i] /= sum
  return out
}

export async function classify(crops: Uint8Array, cells: number[]): Promise<Map<number, CellReading> | null> {
  const loaded = await load()
  if (!loaded || !cells.length) return null
  const area = CROP * CROP
  const input = new Float32Array(cells.length * 3 * area)
  cells.forEach((cell, n) => {
    for (let p = 0; p < area; p++) for (let c = 0; c < 3; c++) input[n * 3 * area + c * area + p] = crops[(cell * area + p) * 3 + c] / 255
  })
  const output = await loaded.session.run({ image: new loaded.Tensor('float32', input, [cells.length, 3, CROP, CROP]) })
  const types = output.type.data
  const directions = output.direction.data
  const readings = new Map<number, CellReading>()
  cells.forEach((cell, n) => {
    const p = softmax(types, n * TYPES.length, TYPES.length)
    const d = softmax(directions, n * 3, 3)
    const type = new Map<PieceType, number>()
    TYPES.forEach((t, i) => t !== null && type.set(t, p[i]))
    readings.set(cell, { empty: p[0], type, up: d[1] / (d[1] + d[2] + 1e-9) })
  })
  return readings
}
