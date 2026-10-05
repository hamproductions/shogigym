import '@/app/modes/lesson/lesson.css'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loadGames } from '@/app/games'
import { ImportBox } from './ImportBox'
import type { AnalyzeGames } from './useAnalyzeGames'
import { Button } from '@/app/ui/Button'

export function GamesBox({ games }: { games: AnalyzeGames }) {
  const { t } = useTranslation()
  const [note, setNote] = useState<string | null>(null)
  const [view, setView] = useState<'none' | 'saved' | 'load'>('none')
  const current = games.slotId
  const stored = loadGames()
  const toggle = (next: 'saved' | 'load') => setView(view === next ? 'none' : next)
  return (
    <div className="app-games">
      <div className="app-actions">
        <Button
          size="sm"
          onClick={() =>
            setNote(games.saveSlot() ? (current ? t('games.savedUpdatedThisSlot') : t('games.savedToYourGames')) : t('games.couldNotSaveBrowserStorage'))
          }
        >
          {current ? t('games.saveChanges') : t('games.saveGame')}
        </Button>
        <Button size="sm" on={view === 'saved'} onClick={() => toggle('saved')}>
          {t('games.savedGames')} <span className="app-count">{stored.length}</span>
        </Button>
        <Button size="sm" on={view === 'load'} onClick={() => toggle('load')}>
          {t('games.loadAGame')}
        </Button>
        <Button
          size="sm"
          onClick={() =>
            navigator.clipboard.writeText(games.exportKif()).then(
              () => setNote(t('games.kifCopiedPasteItInto')),
              () => setNote(t('games.couldNotCopyToThe')),
            )
          }
        >
          {t('games.copyKif')}
        </Button>
      </div>
      {note && <p className="app-muted">{note}</p>}
      {view === 'saved' && (
        <ul className="app-game-list">
          {stored.length === 0 && <li className="app-muted">{t('games.noSavedGamesYetPress')}</li>}
          {stored.map((g) => (
            <li key={g.id} className={g.id === current ? 'on' : ''}>
              <button className="app-game-open" onClick={() => games.openSlot(g)}>
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
      )}
      {view === 'load' && <ImportBox onImport={games.importGame} open />}
    </div>
  )
}
