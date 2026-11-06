import { useEffect, useState } from 'react'
import type { StoredGame } from '@/app/games'
import type { GameSummary, GameSummaryInput } from './gameSummary'

const cache = new Map<string, GameSummary>()
const keys = new WeakMap<StoredGame, string>()
const keyOf = (game: StoredGame) => {
  let key = keys.get(game)
  if (!key) {
    key = JSON.stringify([game.start, game.moves, game.detectionPreset ?? null])
    keys.set(game, key)
  }
  return key
}

export function useGameSummaries(games: StoredGame[]) {
  const [summaries, setSummaries] = useState(() => new Map<string, GameSummary>())
  useEffect(() => {
    const pending = new Map<string, GameSummaryInput>()
    for (const game of games) {
      const key = keyOf(game)
      if (!cache.has(key)) pending.set(key, { key, start: game.start, moves: game.moves, detectionPreset: game.detectionPreset })
    }
    if (!pending.size) return
    const worker = new Worker(new URL('./gameSummary.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = ({ data }: MessageEvent<{ key: string; summary: GameSummary }>) => {
      cache.set(data.key, data.summary)
      if (cache.size > 500) cache.delete(cache.keys().next().value!)
      setSummaries((previous) => new Map(previous).set(data.key, data.summary))
      pending.delete(data.key)
      if (!pending.size) worker.terminate()
    }
    worker.onerror = () => {
      const empty = { strategy: null, castle: null }
      setSummaries((previous) => {
        const next = new Map(previous)
        for (const key of pending.keys()) if (!next.has(key)) next.set(key, { key, sente: empty, gote: empty, names: [], error: 'unavailable' })
        return next
      })
      worker.terminate()
    }
    worker.postMessage([...pending.values()])
    return () => worker.terminate()
  }, [games])
  return (game: StoredGame) => {
    const key = keyOf(game)
    return summaries.get(key) ?? cache.get(key)
  }
}
