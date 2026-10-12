import '@/app/modes/lesson/lesson.css'
import { useTranslation } from 'react-i18next'
import type { StoredGame } from '@/app/games'
import type { AnalyzeGames } from './useAnalyzeGames'
import { Button } from '@/app/ui/Button'

export function SavedGames({ games, stored, onOpen }: { games: AnalyzeGames; stored: StoredGame[]; onOpen?: () => void }) {
  const { t } = useTranslation()
  return (
    <ul className="app-game-list">
      {stored.length === 0 && <li className="app-muted">{t('games.noSavedGamesYetPress')}</li>}
      {stored.map((g) => (
        <li key={g.id} className={g.id === games.slotId ? 'on' : ''}>
          <button
            className="app-game-open"
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
          <Button
            variant="icon"
            className="app-var-x"
            onClick={() => games.deleteSlot(g)}
            aria-label={t('games.delete', { title: g.title })}
            title={t('games.delete2')}
          >
            ×
          </Button>
        </li>
      ))}
    </ul>
  )
}
