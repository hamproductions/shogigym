export type MoveStat = { usi: string; games: number; senteWins: number; goteWins: number }
export type PositionStats = { games: number; moves: MoveStat[]; book?: { usi: string; eval: number } }
export type RawPosition = { n: number; m: [string, number, number, number][]; b?: [string, number] }
export type StatsMeta = { games: number; sources: { id: string; games: number }[]; minGames: number; maxPly: number; built: string }

export const statsKey = (sfen: string) => sfen.split(' ').slice(0, 3).join(' ')

export function statsShard(key: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 0x01000193)
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 2)
}

const base = () => `${import.meta.env.BASE_URL}book/`
const shards = new Map<string, Promise<Record<string, RawPosition>>>()
let meta: Promise<StatsMeta | null> | null = null

function fetchJson<T>(url: string, fallback: T): Promise<T> {
  return fetch(url)
    .then((r) => (r.ok ? (r.json() as Promise<T>) : fallback))
    .catch(() => fallback)
}

export function loadStatsMeta() {
  meta ??= fetchJson<StatsMeta | null>(`${base()}meta.json`, null)
  return meta
}

export async function loadStats(sfen: string): Promise<PositionStats | null> {
  const key = statsKey(sfen)
  const shard = statsShard(key)
  if (!shards.has(shard)) shards.set(shard, fetchJson<Record<string, RawPosition>>(`${base()}${shard}.json`, {}))
  const raw = (await shards.get(shard))?.[key]
  if (!raw) return null
  return { games: raw.n, moves: raw.m.map(([usi, games, senteWins, goteWins]) => ({ usi, games, senteWins, goteWins })), book: raw.b ? { usi: raw.b[0], eval: raw.b[1] } : undefined }
}
