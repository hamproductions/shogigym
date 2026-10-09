import type { Label } from './analysis'

export type Mistake = {
  id: string
  sfen: string
  played: string
  best: string
  bestPv: string[]
  label: Label
  reasons: string[]
  game: string
  ply: number
  /** Primary weakness category (see utils/learning.ts), set when the mistake is saved. */
  tag?: string
}

const KEY = 'joseki-practice:mistakes:v1'

export function loadMistakes(): Mistake[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveMistakes(items: Mistake[]) {
  const existing = loadMistakes()
  const ids = new Set(existing.map((m) => m.id))
  const merged = [...existing, ...items.filter((m) => !ids.has(m.id))]
  try {
    localStorage.setItem(KEY, JSON.stringify(merged))
  } catch (error) {
    console.warn('mistakes not persisted', error)
  }
  return merged.length - existing.length
}

export function removeMistake(id: string) {
  localStorage.setItem(KEY, JSON.stringify(loadMistakes().filter((m) => m.id !== id)))
}
