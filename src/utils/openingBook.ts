import { binaryStore } from './binaryStore'
import { positionOf } from './shogi'
import i18n from './i18n'
import { bookPosition, bookShard, flipBookMove } from './bookPosition'

export interface OpeningMove {
  usi: string
  score: number
  depth: number
}
type Shard = Record<string, [string, number, number][]>
const store = binaryStore('shogigym:book', 'yaneuraou')
export const readBookFile = store.read
export const clearBookFile = store.clear
export const useBookFile = store.useInfo
export async function saveBookFile(file: File) {
  const header = await file.slice(0, 128).text()
  if (!header.startsWith('#YANEURAOU-DB2016')) throw new Error(i18n.t('settings.invalidBook'))
  await store.save(file)
}

const shards = new Map<number, Promise<Shard>>()
export async function openingMoves(sfen: string): Promise<OpeningMove[]> {
  const { key, flipped } = bookPosition(sfen)
  const shard = bookShard(key)
  let loading = shards.get(shard)
  if (!loading) {
    loading = (async () => {
      const { compactShard, compactUrl } = await import('./bookDownload')
      const cached = await compactShard(shard)
        .read()
        .catch(() => null)
      if (cached) {
        try {
          return JSON.parse(new TextDecoder().decode(cached.bytes)) as Shard
        } catch {
          await compactShard(shard)
            .clear()
            .catch(() => {})
        }
      }
      const response = await fetch(compactUrl(shard), { signal: AbortSignal.timeout(4000) })
      if (!response.ok) throw new Error(`Opening book: HTTP ${response.status}`)
      const blob = await response.blob()
      const parsed = JSON.parse(await blob.text()) as Shard
      await compactShard(shard)
        .save(new File([blob], `${shard}.json`))
        .catch(() => {})
      return parsed
    })()
    shards.set(shard, loading)
    if (shards.size > 8) shards.delete(shards.keys().next().value!)
    loading.catch(() => {
      if (shards.get(shard) === loading) shards.delete(shard)
    })
  }
  const entries = (await loading)[key] ?? []
  const position = positionOf(sfen)
  return entries.flatMap(([raw, score, depth]) => {
    const usi = flipped ? flipBookMove(raw) : raw
    const move = position.createMoveByUSI(usi)
    return move && position.isValidMove(move) ? [{ usi, score, depth }] : []
  })
}
