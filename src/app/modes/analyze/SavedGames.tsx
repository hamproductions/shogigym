import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { gameChoice, loadGames, setGameRole } from '@/app/games'
import { GameRoleToggle } from './GameRoleToggle'
import type { AnalyzeGames } from './useAnalyzeGames'
import { Button } from '@/app/ui/Button'
import { muted } from '@/app/panels/panels.styles'
import { gameList, gameOpen } from '@/app/modes/lesson/lesson.styles'

export function SavedGames({ games, onOpen }: { games: AnalyzeGames; onOpen?: () => void }) {
  const { t } = useTranslation()
  const [, bump] = useState(0)
  const stored = loadGames()
  return (
    <ul className={gameList}>
      {stored.length === 0 && <li className={muted}>{t('games.noSavedGamesYetPress')}</li>}
      {stored.map((g) => (
        <li key={g.id}>
          <button
            className={gameOpen({ on: g.id === games.slotId })}
            onClick={() => {
              games.openSlot(g)
              onOpen?.()
            }}
          >
            <strong>{g.title}</strong>
            <span>
              {t('games.moves', { count: g.moves.length })}
              {g.tree && g.tree.children.length > 1 ? t('games.withVariations') : ''}
            </span>
          </button>
          <GameRoleToggle
            value={gameChoice(g)}
            onChange={(choice) => {
              setGameRole(g.id, choice === 'study' ? 'study' : 'mine', choice === 'study' ? undefined : choice)
              bump((n) => n + 1)
            }}
          />
          <Button variant="icon" onClick={() => games.deleteSlot(g)} aria-label={t('games.delete', { title: g.title })} title={t('games.delete2')}>
            ×
          </Button>
        </li>
      ))}
    </ul>
  )
}
