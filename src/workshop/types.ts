import type { IconName } from './icons'

export type Mode = 'lesson' | 'drill' | 'tsume' | 'tesuji' | 'spar' | 'analyze'
export type Tab = 'engine' | 'coach' | 'flow' | 'moves'
export type Level = 'rules' | 'new'
export type LessonMode = 'study' | 'quiz'
export type Game = { start: string; moves: string[] }
export type Preview = { base: number; moves: string[]; step: number; title: string }
export type Score = { right: number; wrong: number; shown?: number; retried?: number }
export type Confirm = { text: string; run: () => void; yes?: string; no?: string }

export const MODES: { id: Mode; icon: IconName }[] = [
  { id: 'spar', icon: 'spar' },
  { id: 'analyze', icon: 'analyze' },
  { id: 'lesson', icon: 'study' },
  { id: 'drill', icon: 'review' },
  { id: 'tsume', icon: 'tsume' },
  { id: 'tesuji', icon: 'flow' },
]

export const TABS: Tab[] = ['coach', 'engine', 'flow', 'moves']

export const isGameMode = (mode: Mode) => mode === 'spar' || mode === 'analyze'

export const freshScore = (): Score => ({ right: 0, wrong: 0 })
