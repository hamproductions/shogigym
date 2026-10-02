import type { Tree } from './tree'

export type StoredGame = { id: string; title: string; savedAt: number; start: string; moves: string[]; tree?: Tree; userSide: 'sente' | 'gote' }

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

export function deleteGame(id: string) {
  write(loadGames().filter((g) => g.id !== id))
}
