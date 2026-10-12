import '@/app/modes/lesson/lesson.css'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loadGames } from '@/app/games'
import { ImportBox } from './ImportBox'
import { SavedGames } from './SavedGames'
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
      {view === 'saved' && <SavedGames games={games} />}
      {view === 'load' && <ImportBox onImport={games.importGame} open />}
    </div>
  )
}
