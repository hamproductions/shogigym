import '@/app/modes/lesson/lesson.css'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { gameChoice, loadGames, setGameRole } from '@/app/games'
import { GameRoleToggle } from './GameRoleToggle'
import { ImportBox } from './ImportBox'
import { SavedGames } from './SavedGames'
import type { AnalyzeGames } from './useAnalyzeGames'
import { Button } from '@/app/ui/Button'

export function GamesBox({ games }: { games: AnalyzeGames }) {
  const { t } = useTranslation()
  const [note, setNote] = useState<string | null>(null)
  const [, setRole] = useState(0)
  const [view, setView] = useState<'none' | 'saved' | 'load'>('none')
  const current = games.slotId
  const stored = loadGames()
  const now = stored.find((g) => g.id === current)
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
      <div className="app-role-row">
        <span className="app-muted">{t('insights.countIn')}</span>
        <GameRoleToggle
          value={now ? gameChoice(now) : 'study'}
          onChange={(choice) => {
            if (now) setGameRole(now.id, choice === 'study' ? 'study' : 'mine', choice === 'study' ? undefined : choice)
            else setNote(games.saveSlot(choice) ? t('insights.savedChoice') : t('games.couldNotSaveBrowserStorage'))
            setRole((n) => n + 1)
          }}
        />
      </div>
      {note && <p className="app-muted">{note}</p>}
      {view === 'saved' && <SavedGames games={games} />}
      {view === 'load' && <ImportBox onImport={games.importGame} open />}
    </div>
  )
}
