import type { DetectionPreset, DetectionResult } from '@/utils/formationTags'
import type { Tree } from './tree'

export type GameResult = 'win' | 'loss' | 'resigned' | 'time'

export type StoredGame = {
  id: string
  title: string
  savedAt: number
  start: string
  moves: string[]
  detectionPreset?: DetectionPreset
  detectionResult?: DetectionResult
  tree?: Tree
  userSide: 'sente' | 'gote'
  result?: GameResult
  vsAi?: boolean
  /** 'mine' feeds cross-game trends; 'study' (imports, pro games) stays out of them. Defaults to mine for games played here. */
  role?: GameRole
}

export type GameRole = 'mine' | 'study'
export type GameChoice = 'sente' | 'gote' | 'study'
export const gameRole = (g: StoredGame): GameRole => g.role ?? (g.vsAi ? 'mine' : 'study')

const KEY = 'joseki-practice:games:v1'

export function loadGames(): StoredGame[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

function write(games: StoredGame[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(games))
    return true
  } catch (error) {
    console.warn('games not persisted', error)
    return false
  }
}

export function storeGame(game: StoredGame) {
  return write([game, ...loadGames().filter((g) => g.id !== game.id)])
}

export function setGameRole(id: string, role: GameRole, userSide?: 'sente' | 'gote') {
  write(loadGames().map((g) => (g.id === id ? { ...g, role, ...(userSide ? { userSide } : {}) } : g)))
}

export function deleteGame(id: string) {
  write(loadGames().filter((g) => g.id !== id))
}

export const gameId = (start: string, moves: string[]) => {
  let h = 0
  for (const c of `${start}|${moves.join(' ')}`) h = (h * 31 + c.charCodeAt(0)) | 0
  return `ai-${(h >>> 0).toString(36)}`
}
export const gameChoice = (g: StoredGame): GameChoice => (gameRole(g) === 'study' ? 'study' : g.userSide)
