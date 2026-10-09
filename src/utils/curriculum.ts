import type { Text } from '@/data/strategies'

export type SourceLine = {
  from: string | null
  start: string
  moves: string[]
  sides: string
  text: string
  corrected?: { index: number; stated: string; played: string }[]
  adjusted?: string[]
  statedFrom?: string
  prose?: string
  swappedMarks?: boolean
  note?: Text
}
export type CropPanel = {
  w: number
  h: number
  rows: string[]
  origin?: [number, number]
  edges?: ('top' | 'bottom' | 'left' | 'right')[]
  zone?: number
  arrows?: [number, number, number, number, string?][]
  free?: [number, number, string][]
  drop?: [number, number]
  hand?: string
  toHand?: [number, number]
  choice?: string[]
  verdict?: 'ok' | 'ng'
  note?: Text
  regions?: [number, number, number, number, string, string][]
  label?: Text
}
export type SourceDiagram = {
  id: string
  title: Text
  explain?: Text
  section?: Text
  source: string
  sfen?: string
  view?: 'gote'
  handsHidden?: 'b' | 'w' | 'both'
  partial?: boolean
  marks?: { last?: string; arrows?: string[]; ghosts?: string[]; boxes?: string[]; dashed?: string[] }
  line?: SourceLine
  statedMoves?: string
  crop?: { panels: CropPanel[]; cycle?: boolean }
  pieces?: { items: [string, number, string][] }
}

export type LessonFigure = Omit<SourceDiagram, 'line' | 'sfen' | 'title' | 'explain' | 'statedMoves'>
