import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Wrap } from 'styled-system/jsx'
import { loadGames } from '@/app/games'
import { ImportBox } from './ImportBox'
import { SavedGames } from './SavedGames'
import type { AnalyzeGames } from './useAnalyzeGames'
import { Button } from '@/app/ui/Button'
import { Badge } from '@/components/ui'
import { muted } from '@/app/panels/panels.styles'
import { games as gamesBox } from '@/app/modes/lesson/lesson.styles'

export function GamesBox({ games, browse = true }: { games: AnalyzeGames; browse?: boolean }) {
  const { t } = useTranslation()
  const [note, setNote] = useState<string | null>(null)
  const [view, setView] = useState<'none' | 'saved' | 'load'>('none')
  const current = games.slotId
  const stored = loadGames()
  const toggle = (next: 'saved' | 'load') => setView(view === next ? 'none' : next)
  return (
    <div className={gamesBox}>
      <Wrap gap="2" align="center">
        <Button
          size="sm"
          onClick={() =>
            setNote(games.saveSlot() ? (current ? t('games.savedUpdatedThisSlot') : t('games.savedToYourGames')) : t('games.couldNotSaveBrowserStorage'))
          }
        >
          {current ? t('games.saveChanges') : t('games.saveGame')}
        </Button>
        {browse && (
          <>
            <Button size="sm" on={view === 'saved'} onClick={() => toggle('saved')}>
              {t('games.savedGames')}{' '}
              <Badge asChild ml="1" px="1.5" bg="surface.3" fontSize="2xs">
                <span>{stored.length}</span>
              </Badge>
            </Button>
            <Button size="sm" on={view === 'load'} onClick={() => toggle('load')}>
              {t('games.loadAGame')}
            </Button>
          </>
        )}
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
      </Wrap>
      {note && <p className={muted}>{note}</p>}
      {view === 'saved' && <SavedGames games={games} />}
      {view === 'load' && <ImportBox onImport={games.importGame} open />}
    </div>
  )
}
