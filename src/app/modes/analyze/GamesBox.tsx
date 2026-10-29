import { Suspense, lazy, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Wrap } from 'styled-system/jsx'
import { loadGames } from '@/app/games'
import { SavedGames } from './SavedGames'
import type { AnalyzeGames } from './useAnalyzeGames'
import { Button } from '@/app/ui/Button'
import { Badge } from '@/components/ui'
import { Muted } from '@/app/panels/panels.styles'

const ImportBox = lazy(() => import('./ImportBox').then((m) => ({ default: m.ImportBox })))

export function GamesBox({ games, browse = true }: { games: AnalyzeGames; browse?: boolean }) {
  const { t } = useTranslation()
  const [note, setNote] = useState<string | null>(null)
  const [view, setView] = useState<'none' | 'saved' | 'load'>('none')
  const current = games.slotId
  const stored = loadGames()
  const toggle = (next: 'saved' | 'load') => setView(view === next ? 'none' : next)
  return (
    <Box m="{spacing.3} 0 {spacing.3}" p="{spacing.2.5} 0 {spacing.3}" borderTop="1px solid {colors.border}" borderBottom="1px solid {colors.border}">
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
      {note && <Muted m="{spacing.2} 0 0">{note}</Muted>}
      {view === 'saved' && <SavedGames games={games} />}
      {view === 'load' && (
        <Suspense fallback={null}>
          <ImportBox onImport={games.importGame} open />
        </Suspense>
      )}
    </Box>
  )
}
