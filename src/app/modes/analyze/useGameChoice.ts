import { useState } from 'react'
import { gameChoice, loadGames, setGameRole, type GameChoice } from '@/app/games'
import type { AnalyzeGames } from './useAnalyzeGames'

/** The open game's trends choice. Picking a side saves the game (if needed) and counts it; Study leaves it out. */
export function useGameChoice(games: AnalyzeGames): [GameChoice | null, (choice: GameChoice) => void] {
  const [, bump] = useState(0)
  const now = loadGames().find((g) => g.id === games.slotId)
  const choose = (choice: GameChoice) => {
    if (now) setGameRole(now.id, choice === 'study' ? 'study' : 'mine', choice === 'study' ? undefined : choice)
    else if (choice !== 'study') games.saveSlot(choice)
    bump((n) => n + 1)
  }
  return [now ? gameChoice(now) : null, choose]
}
