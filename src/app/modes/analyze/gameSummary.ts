import type { DetectionPreset } from '@/utils/formationTags'

export type GameSummaryInput = {
  key: string
  start: string
  moves: string[]
  detectionPreset?: DetectionPreset
}

export type FormationSummary = {
  strategy: string | null
  castle: string | null
}

export type GameSummary = {
  key: string
  sente: FormationSummary
  gote: FormationSummary
  names: string[]
  error?: 'invalid' | 'unavailable'
}

export type GameSummaryResultMessage = { key: string; summary: GameSummary }

export const emptyFormationSummary = (): FormationSummary => ({
  strategy: null,
  castle: null,
})

export const emptyGameSummary = (key: string, error?: GameSummary['error']): GameSummary => ({
  key,
  sente: emptyFormationSummary(),
  gote: emptyFormationSummary(),
  names: [],
  ...(error ? { error } : {}),
})

export const formationSummary = (selected: { strategy: string | null; castle: string | null }): FormationSummary => ({
  strategy: selected.strategy,
  castle: selected.castle,
})
