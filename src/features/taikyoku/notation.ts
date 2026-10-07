import catalogJson from './catalog.json'

export const SIZE = 36

export type Side = 'b' | 'w'

export type PieceInfo = { n: string; k: string; r: number; c: number; v: number; k2?: string; p?: string }

export const catalog = catalogJson as Record<string, PieceInfo>

/** A piece on the board: TSN key (`+` marks a promoted form) and owner. */
export type Cell = { key: string; side: Side }

/** Board indexed [rank - 1][file - 1]; rank 1 is Sente's back rank. */
export type Grid = (Cell | null)[][]

export type Pos = { file: number; rank: number }

export type EngineMove = { text: string; from: Pos; to: Pos; mid: Pos | null; promote: boolean }

const MOVE_RE = /^([a-zA-J])(\d{1,2})([a-zA-J])(\d{1,2})(?:\/([a-zA-J])(\d{1,2}))?(\+)?$/

const fileOf = (ch: string) => (ch >= 'a' ? ch.charCodeAt(0) - 96 : ch.charCodeAt(0) - 64 + 26)

export const fileLabel = (file: number) => String(file)

export const squareName = ({ file, rank }: Pos) => `${fileLabel(file)}${rank}`

export const same = (a: Pos, b: Pos) => a.file === b.file && a.rank === b.rank

export function parseMove(text: string): EngineMove | null {
  const m = MOVE_RE.exec(text)
  if (!m) return null
  return {
    text,
    from: { file: fileOf(m[1]), rank: Number(m[2]) },
    to: { file: fileOf(m[3]), rank: Number(m[4]) },
    mid: m[5] ? { file: fileOf(m[5]), rank: Number(m[6]) } : null,
    promote: m[7] === '+',
  }
}

export type Snapshot = { grid: Grid; turn: Side; royals: { b: number; w: number }; counts: { b: number; w: number } }

/** Parses the engine's `d` output: a TSN line followed by the royal counts. */
export function parseSnapshot(lines: string[]): Snapshot | null {
  const tsn = lines.find((l) => l.includes('/') && / [bw] \d+ \d+$/.test(l))
  const royal = lines.find((l) => l.startsWith('reales'))
  if (!tsn || !royal) return null
  const [board, turn] = tsn.split(' ')
  const rows = board.split('/')
  if (rows.length !== SIZE) return null
  const grid: Grid = Array.from({ length: SIZE }, () => Array<Cell | null>(SIZE).fill(null))
  const counts = { b: 0, w: 0 }
  rows.forEach((row, i) => {
    const rank = SIZE - i
    let file = 0
    for (const token of row.split(',')) {
      if (/^\d+$/.test(token)) {
        file += Number(token)
        continue
      }
      const side = token.slice(-1) as Side
      grid[rank - 1][file] = { key: token.slice(0, -1), side }
      counts[side]++
      file++
    }
  })
  const r = /b=(\d+) w=(\d+)/.exec(royal)
  return { grid, turn: turn as Side, royals: { b: Number(r?.[1] ?? 0), w: Number(r?.[2] ?? 0) }, counts }
}

export const cellAt = (grid: Grid, { file, rank }: Pos) => grid[rank - 1]?.[file - 1] ?? null

export type Score = { cp: number; depth: number }

export type EngineInfo = Score & { pv: EngineMove[] }

export function parseInfo(line: string): EngineInfo | null {
  const m = /^info depth (\d+) score cp (-?\d+)/.exec(line)
  if (!m) return null
  const tokens = line.split(' ')
  const at = tokens.indexOf('pv')
  const pv =
    at < 0
      ? []
      : tokens
          .slice(at + 1)
          .map(parseMove)
          .filter((move): move is EngineMove => !!move)
  return { depth: Number(m[1]), cp: Number(m[2]), pv }
}

/** Face text for a tile: at most two characters, as the shared tile renderer lays out. */
export function glyphOf(key: string, side: Side) {
  const info = catalog[key]
  const text = (side === 'w' && info?.k2) || info?.k || ''
  if (!text) return key.replace('+', '').slice(0, 2)
  const chars = [...text]
  return chars.length <= 2 ? text : chars[0] + chars[chars.length - 1]
}
