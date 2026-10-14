import '@/app/modes/lesson/lesson.css'
import { useTranslation } from 'react-i18next'
import { gameChoice, loadGames } from '@/app/games'
import { savedAtLabel, sideMark } from '@/utils/notation'
import type { AnalyzeGames } from './useAnalyzeGames'
import { Button } from '@/app/ui/Button'

export function SavedGames({ games, onOpen }: { games: AnalyzeGames; onOpen?: () => void }) {
  const { t } = useTranslation()
  const stored = loadGames()
  return (
    <ul className="app-game-list">
      {stored.length === 0 && <li className="app-muted">{t('games.noSavedGamesYetPress')}</li>}
      {stored.map((g) => {
        const names = g.players && (g.players.sente || g.players.gote) ? g.players : undefined
        return (
          <li key={g.id} className={g.id === games.slotId ? 'on' : ''}>
            <button
              className="app-game-open"
              onClick={() => {
                games.openSlot(g)
                onOpen?.()
              }}
            >
              <strong>{names ? `${sideMark('sente')}${names.sente ?? '?'} vs ${sideMark('gote')}${names.gote ?? '?'}` : g.title}</strong>
              <span>
                {names && `${savedAtLabel(new Date(g.savedAt))} · `}
                {t('games.moves', { count: g.moves.length })}
                {g.tree && g.tree.children.length > 1 ? t('games.withVariations') : ''}
                {' · '}
                {t(`insights.role.${gameChoice(g)}`)}
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
        )
      })}
    </ul>
  )
}
